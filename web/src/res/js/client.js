'use strict';

const get_problems = async function() {
	await fetch('/user_problems')
		.then(response => response.json())
		.then(data => {
			localStorage.setItem('problems', data);
		});
};

if (localStorage.getItem('problems') === null) {
	(async () => {
		const problems = await get_problems();

	})().catch((reason) => {

	});
}
