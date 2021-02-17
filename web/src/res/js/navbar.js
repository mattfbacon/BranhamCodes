'use strict';

(async () => {
	// eslint-disable-next-line no-undef
	const user_string = Cookies.get('user_string');
	if (user_string) {
		const obj = await (await fetch('/user_info')).json();
		if (obj.username !== null && obj.avatar_url !== null) {
			const user_name_element = document.createElement('P');
			user_name_element.innerText = obj.username;
			const navbar_element = document.getElementById('nav');
			const login = document.getElementById('login_button');
			const image = document.createElement('IMG');
			image.src = obj.avatar_url;
			const avatar_element = document.getElementById('avatar');
			navbar_element.removeChild(login);
			avatar_element.appendChild(user_name_element);
			avatar_element.appendChild(image);
		}
	}
})().catch((reason) => {
	throw reason;
});
