import mongo = require('mongodb');
import pino = require('pino');
import { InstallPackageAction, textChangeRangeIsUnchanged } from 'typescript';
import { v4 as uuid } from 'uuid';
const db_logger = pino({'name': 'db'});

/*
username: string
avatar_url: string
problems: array
user_string: string
*/

class DBManager {
	db: mongo.Collection;
	constructor(db: mongo.Collection) {
		this.db = db;
	}
	async DELETE_ENTIRE_DATABASE() {
		await this.db.drop();
	}
	private async get_user(user_string: string) {
		return await this.db.findOne({ user_string });
	}
	async add_user(username: string, url: string) {
		const user = await this.db.findOne({ username });
		if (user === null) {
			const user_string = uuid();
			await this.db.insertOne({
				username,
				avatar_url: url,
				problems: [1],
				user_string
			});
			return user_string;
		} else {
			db_logger.warn(`user already exists: ${username}`);
			return user.user_string;
		}
	}
	async get_user_problems(user_string: string) {
		const user = await this.get_user(user_string);
		if (user !== null) {
			return user.problems;
		} else {
			db_logger.warn(`user does not exist: ${user_string}`);
			return [1];
		}
	}
	async has_user_problem(user_string: string, problem_num: number) {
		const user = await this.get_user(user_string);
		if (user !== null) {
			return user.problems.includes(problem_num);
		} else {
			db_logger.warn(`user does not exist: ${user_string}`);
			return false;
		}
	}
	async add_user_problems(user_string: string, ...problems: number[]) {
		const user = await this.get_user(user_string);
		if (user !== null) {
			this.db.updateOne({ _id: user._id }, {
				$addToSet: {
					problems: { $each: problems }
				}
			});
		} else {
			db_logger.warn(`user does not exist: ${user_string}`);
			return false;
		}
	}
}

export { DBManager };
