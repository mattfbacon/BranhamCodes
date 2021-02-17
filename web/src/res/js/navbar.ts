'use strict';
/* global Cookies */

declare interface CookieOptions {
	expires?: number | Date;
	path?: string;
	domain?: string;
	secure?: boolean;
	sameSite?: string;
}
declare interface CookiesType {
	get(): Record<string, string>;
	get(key: string): string | undefined;
	set(key: string, value: string, options?: CookieOptions): void;
	remove(key: string, options?: CookieOptions): void;
}
declare const Cookies: CookiesType;

(async () => {
	const user_string = Cookies.get('user_string');
	if (user_string) {
		const user_info = await (await fetch('/user_info')).json();
		if (user_info.username && user_info.avatar_url) {
			document.getElementById('login_button').style.display = 'none';
			document.getElementById('username').innerText = user_info.username;
			document.getElementById('avatar').setAttribute('src', user_info.avatar_url);
			document.getElementById('user_info').style.width = '';
		}
	}
})().catch((reason) => {
	throw reason;
});
