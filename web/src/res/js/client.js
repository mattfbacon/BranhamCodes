'use strict';

const get_problems = async function() {
	const response = await fetch('/user_problems');
	return response.json();
};

if (localStorage.getItem('problems') === null) {
	(async () => {
		const problems = await get_problems();
		localStorage.setItem('problems', problems);
	})().catch((reason) => {
		console.log(reason);
	});
}
