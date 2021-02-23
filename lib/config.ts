'use strict';

interface Config {
	DEBUG: boolean;
	GITHUB_ID: string;
	GITHUB_SECRET: string;
	PORT: number;
}

const config: Config = {
	'DEBUG': false,
	'GITHUB_ID': null,
	'GITHUB_SECRET': null,
	'PORT': 9000,
};

export default config;
