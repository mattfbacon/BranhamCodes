'use strict';

declare interface ProblemResponse {
	newproblems?: number[];
	num: number;
	result: string;
	submission: number;
	submissiontext: string;
	type: 'correct' | 'incorrect' | 'unevaluated';
}

import cookie_parser = require('cookie-parser');
import pino = require('pino');
const logger = pino({ 'name': 'main', });
const web_logger = logger.child({ 'name': 'http', });
import pino_http = require('pino-http')
const http_logger = pino_http({ 'name': 'http', });
import express = require('express');
import mongo = require('mongodb');
import nunjucks = require('nunjucks');
import { DBManager, User, } from './lib/database';
import config from './lib/config';
import { promises as fs, } from 'fs';
import phin = require('phin');

const DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'branhamcodes';

let _conn: mongo.MongoClient;

const exit_handler = async () => {
	if (typeof _conn === 'undefined' || !_conn.isConnected()) {
		logger.debug('shut down before MongoDB was started');
	} else {
		logger.debug('closing MongoDB connection...');
		await _conn.close();
		logger.info('closed MongoDB connection');
	}
};

(async () => {
	const graph: number[][] = JSON.parse(await fs.readFile('web/dist/static/graph.json', 'utf-8') as string);
	const answers: number[] = JSON.parse(await fs.readFile('answers.json', 'utf-8') as string);

	_conn = new mongo.MongoClient(DB_URL);
	try {
		await _conn.connect();
	} catch (e) {
		if (e instanceof mongo.MongoNetworkError) {
			logger.fatal('Could not connect to MongoDB. Is the server running?');
			await exit_handler();
			process.exit(1); // eslint-disable-line no-process-exit -- nothing to clean up and don't want to give an exception for something simple.
		} else {
			throw e;
		}
	}
	const _database = _conn.db(DB_NAME).collection('users');
	const database = new DBManager(_database);

	let leaderboard: Partial<User>[] = await database.get_leader_board();

	const app = express();
	app.set('query parser', 'simple'); // https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0

	nunjucks.configure('web/dist/dynamic/', {
		'express': app,
		'lstripBlocks': true,
		'noCache': config.DEBUG,
		'trimBlocks': true,
	}).addGlobal('isNaN', isNaN);
	app.set('view engine', 'html');

	app.use(http_logger);

	app.use(cookie_parser());

	app.use(express.urlencoded({
		'extended': true,
	}));

	app.get('/leaderboard', (req, res) => {
		res.render('leaderboard', { leaderboard, });
	});

	app.get('/user_problems', async (req, res) => {
		if (Object.prototype.hasOwnProperty.call(req.cookies, 'user_string')) {
			res.send(await database.get_user_problems(req.cookies.user_string));
		} else {
			res.send([ 1, ]);
		}
	});

	app.get('/user_info', async (req, res) => {
		if (Object.prototype.hasOwnProperty.call(req.cookies, 'user_string')) {
			res.send({ 'avatar_url': await database.get_user_avatar(req.cookies.user_string), 'username': await database.get_user_name(req.cookies.user_string), });
		} else {
			res.send({ 'avatar_url': null, 'username': null, });
		}
	});

	app.get('/login', (req, res) => {
		if (Object.prototype.hasOwnProperty.call(req.cookies, 'user_string')) {
			res.redirect('/');
		} else {
			res.redirect(`https://github.com/login/oauth/authorize?client_id=${config.GITHUB_ID}`);
		}
	});

	app.post('/submit_problem', async (req, res) => {
		if (!Object.prototype.hasOwnProperty.call(req.query, 'problem')) {
			res.status(400);
			res.send('No problem number provided.');
			return;
		}
		const problem_index = parseInt(req.query.problem as string, 10) - 1; // naN propagates so NaN - 1 is NaN
		if (isNaN(problem_index)) { // no problem number provided
			res.status(400); // bad request
			res.send('No problem number provided.');
			return;
		}
		if (problem_index >= answers.length) { // problem number out of range, so problem does not exist
			res.status(400);
			res.send('Problem does not exist.');
			return;
		}
		// at this point we know it's a valid problem, so we just need to check the answer
		if (!Object.prototype.hasOwnProperty.call(req.body, 'textsubmission')) {
			res.status(400);
			res.send('No answer body was recieved.');
			return;
		}
		if (isNaN(req.body.textsubmission)) {
			res.render('problem_response', {
				'num': problem_index + 1,
				'result': 'Response was not a number.',
				'submission': NaN,
				'submissiontext': req.body.textsubmission,
				'type': 'unevaluated',
			} as ProblemResponse);
			return;
		}
		const answer = parseInt(req.body.textsubmission as string, 10);
		if (answers[problem_index] === answer) {
			if (Object.prototype.hasOwnProperty.call(req.cookies, 'user_string') && await database.has_user_problem(req.cookies.user_string, answer)) { // logged in and can access
				await database.add_user_problems(req.cookies.user_string, ...graph[problem_index]);
				leaderboard = await database.get_leader_board();
			}
			res.render('problem_response', {
				'newproblems': Object.prototype.hasOwnProperty.call(req.cookies, 'user_string') ? (void 0) : graph[problem_index],
				'num': problem_index + 1,
				'result': 'You got it right!',
				'submission': answer,
				'submissiontext': req.body.textsubmission,
				'type': 'correct',
			} as ProblemResponse);
			return;
		}
		// the answer was wrong.
		res.render('problem_response', {
			'num': problem_index + 1,
			'result': `Too ${answer > answers[problem_index] ? 'big' : 'small'}.`,
			'submission': answer,
			'submissiontext': req.body.textsubmission,
			'type': 'incorrect',
		} as ProblemResponse);
	});

	app.get('/oauth_callback', async (req, res) => {
		const body = {
			'client_id': config.GITHUB_ID,
			'client_secret': config.GITHUB_SECRET,
			'code': req.query.code,
		};

		const result = await JSON.parse((await phin({
			'data': body,
			'headers': { 'accept': 'application/json', },
			'method': 'POST',
			'url': 'https://github.com/login/oauth/access_token',
		})).body);

		const token = result.access_token;

		const user = await JSON.parse((await phin({
			'headers': {
				'Authorization': `token ${token}`,
				'Content-Type': 'application/json',
				'user-agent': 'node.js',
			},
			'method': 'GET',
			'url': 'https://api.github.com/user',
		})).body);

		const user_string = await database.add_user(user.login, user.avatar_url);
		res.cookie('user_string', user_string);
		res.redirect('/');

	});
	if (config.DEBUG) {
		app.use(express.static('web/dist/static'));
	}

	app.listen(config.PORT, () => logger.info('listening on %d', config.PORT));
})().catch((reason) => {
	throw reason;
});

process.on('SIGINT', () => {
	exit_handler().then(() => process.exit(130));
});
process.on('uncaughtException', (e) => {
	logger.fatal(e);
	exit_handler().then(() => process.exit(1));
});
