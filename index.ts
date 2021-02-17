'use strict';

declare global {

}

import cookie_parser = require('cookie-parser');
import pino = require('pino');
const logger = pino({ 'name': 'main', });
const web_logger = logger.child({ 'name': 'http', });
import pino_http = require('pino-http')
const http_logger = pino_http({ 'name': 'http', });
import express = require('express');
import mongo = require('mongodb');
import { DBManager, } from './lib/database';
import config from './lib/config';
import { promises as fs, } from 'fs';
import url = require('url');
import phin = require('phin');
import { parseConfigFileTextToJson } from 'typescript';

const DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'branhamcodes';

let graph: number[][];

(async () => {
	graph = JSON.parse(await fs.readFile('web/dist/static/graph.json', 'utf-8') as string);
})().catch((reason) => {
	throw reason;
});

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

	const app = express();
	app.use(http_logger);

	app.use(cookie_parser());

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

	app.get('/login', async (req, res) => {
		if (Object.prototype.hasOwnProperty.call(req.cookies, 'user_string')) {
			res.redirect('/')
		} else {
			res.redirect(`https://github.com/login/oauth/authorize?client_id=${config.GITHUB_ID}`);
		}
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
