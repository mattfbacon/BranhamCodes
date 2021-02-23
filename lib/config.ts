'use strict';

interface Config {
    DEBUG: boolean;
    GITHUB_ID: string;
    GITHUB_SECRET: string;
    PORT: number;
}

const config: Config = {
	'DEBUG': true,
	'GITHUB_ID': '94e29cefda7a6c5d20a8',
	'GITHUB_SECRET': '5cf89f5366e0d8a7bbc9eddbcaa5a8353cf95f14',
	'PORT': 9000,
};

export default config;
