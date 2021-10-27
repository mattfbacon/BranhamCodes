'use strict';
interface Config {
	DEBUG: boolean;
	GITHUB_ID: string;
	GITHUB_SECRET: string;
	PORT: number;
  DB_URL: string;
  DB_NAME: string;
}

const config: Config = {
	'DEBUG': false,
	'GITHUB_ID': null,
	'GITHUB_SECRET': null,
	'PORT': 9000,
  'DB_URL': 'mongodb://localhost:27017',
  'DB_NAME': 'branhamcodes'
};

export default config;
