'use strict';

interface Config {
	DEBUG: boolean;
	KEY: string | null;
	PORT: number;
}

const config: Config = {
	'DEBUG': false,
	'KEY': null,
	'PORT': 9000,
};

export default config;
