'use strict';

const get_problems = function() {
	fetch('/user_problems')
		.then(response => response.json())
		.then(data => {
			localStorage.setItem('problems', data);
		});
};

if (localStorage.getItem('problems') === null) {
	get_problems();
}
