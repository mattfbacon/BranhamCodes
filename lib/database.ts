'use strict';

import mongo = require('mongodb');
import pino = require('pino');
import { v4 as uuid, } from 'uuid';
const db_logger = pino({ 'name': 'db', });

declare interface User {
	_id: mongo.ObjectID;
	username: string;
	avatar_url: string;
	problems: number[];
	solved_problems: number[];
	problems_count: number;
	user_string: string;
}

class DBManager {
	db: mongo.Collection;
	constructor(db: mongo.Collection) {
		this.db = db;
	}
	async DELETE_ENTIRE_DATABASE() {
		await this.db.drop();
	}
	private get_user(user_string: string): Promise<User> {
		db_logger.debug(`get_user: ${user_string}`);
		return this.db.findOne({ user_string, });
	}
	async user_exists(user_string: string): Promise<boolean> {
		return (await this.db.findOne({ user_string, })) !== null;
	}
	async add_user(username: string, url: string): Promise<string> {
		const user = await this.db.findOne({ username, } as Partial<User>);
		if (user === null) {
			const user_string = uuid();
			db_logger.debug(`add_user: ${username} ${url} ${user_string}`);
			await this.db.insertOne({
				'avatar_url': url,
				'problems': [ 1, ],
				'problems_count': 0,
				'solved_problems': [],
				user_string,
				username,
			} as User);
			return user_string;
		}
		db_logger.warn(`in add_user: user already exists: ${username}`);
		return user.user_string;
	}
	async get_user_problems(user_string: string): Promise<[ number[], number[], ]> {
		const user = await this.get_user(user_string);
		if (user !== null) {
			db_logger.debug(`get_user_problems: ${user_string}: ${user.problems}`);
			return [ user.problems, user.solved_problems, ];
		}
		db_logger.warn(`in get_user_problems: user does not exist: ${user_string}`);
		return [ [ 1, ], [], ];
	}
	async get_user_name(user_string: string): Promise<string> {
		const user = await this.get_user(user_string);
		if (user !== null) {
			db_logger.debug(`get_user_name: ${user_string}: ${user.username}`);
			return user.username;
		}
		db_logger.warn(`in get_user_name: user does not exist: ${user_string}`);
		return 'guest';
	}
	async get_user_avatar(user_string: string): Promise<string> {
		const user = await this.get_user(user_string);
		if (user !== null) {
			db_logger.debug(`get_user_avatar: ${user_string}: ${user.avatar_url}`);
			return user.avatar_url;
		}
		db_logger.warn(`in get_user_avatar: user does not exist: ${user_string}`);
		return null;
	}
	async has_user_problem(user_string: string, problem_num: number): Promise<boolean> {
		const user = await this.get_user(user_string);
		if (user !== null) {
			db_logger.debug(`has_user_problem: ${user_string} ${problem_num}`);
			return user.problems.includes(problem_num);
		}
		db_logger.warn(`in has_user_problem: user does not exist: ${user_string}`);
		return false;
	}
	async add_user_problems(user_string: string, ...problems: number[]): Promise<boolean> {
		const user = await this.get_user(user_string);
		if (user === null) {
			db_logger.warn(`in add_user_problems: user does not exist: ${user_string}`);
			return false;
		}
		db_logger.debug(`add_user_problems: ${user_string} ${problems}`);
		this.db.updateOne({ '_id': user._id, } as Partial<User>, {
			'$addToSet': {
				'problems': { '$each': problems, },
			},
		});
		return true;
	}
	async add_solved_user_problem(user_string: string, problem: number): Promise<boolean> {
		const user = await this.get_user(user_string);
		if (user === null) {
			db_logger.warn(`in add_user_problems: user does not exist: ${user_string}`);
			return false;
		}
		if (!user.solved_problems.includes(problem)) {
			this.db.updateOne({ '_id': user._id, } as Partial<User>, {
				'$addToSet': {
					'solved_problems': problem,
				},
				'$inc': {
					'problems_count': 1,
				},
			});
		}

		return true;
	}

	get_leaderboard(): Promise<User[]> {
		return this.db.aggregate([
			{ '$match': { 'avatar_url': { '$ne': null, }, }, }, // make sure avatar_url is not null
			{ '$sort': { 'problems_count': -1, }, }, // sort descending by the number of problems (i.e., highest first)
		]).toArray(); // toArray returns a Promise
	}
}

export { DBManager, User, };
