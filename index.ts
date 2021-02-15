'use strict';

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

	if (config.DEBUG) { app.use(express.static('web/dist/static')); }

	app.use(cookie_parser());

	app.get('/user_problems', async (req, res) => {
		if (Object.prototype.hasOwnProperty.call(req.cookies, 'user_string')) {
			res.send(await database.get_user_problems(req.cookies.user_string));
		} else {
			res.send([ 1 ]);
		}
	});

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
