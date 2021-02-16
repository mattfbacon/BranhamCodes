'use strict';

(async () => {
	const my_problems = await (await fetch('/user_problems')).json();
	const problems_to_show = new Set(my_problems);
	// the problem structure for every problem (visible and not visible)
	const global_graph = await (await fetch('/graph.json')).json(); // index is node number - 1 (so idx 0 = first node)
	const my_graph = [];
	for (const problem of my_problems) {
		const problem_s_children = global_graph[problem - 1];
		my_graph[problem - 1] = problem_s_children; // index is 1 less than problem number
		problem_s_children.forEach(child => problems_to_show.add(child));
	}
	const config = {
		'edgeStyle': {
			'all': {
				'color': '#606c76',
				'hidden': {
					'color': '#606c76',
				},
				'highlighted': {
					'color': '#606c76',
				},
				'opacity': 0.2,
				'selected': {
				},
				'width': 4,
			},
		  },
		'fixNodes': false,
		'fixRootNodes': true,
		'initialTranslate': [ 0, 0, ],
		'nodeCaption': (node) => {
			return `Problem  ${node.name}`;
		},
		'nodeCaptionsOnByDefault': true,
		'nodeRadius': 20,
		'nodeStyle': {
			'solved': {
				'borderColor': 'none',
				'color': '#9b4dca',
				'radius'(d) {
					if (d.getProperties().root) { return 20; } return 10;
				},
			},
			'unsolved': {
				'borderColor': 'none',
				'color'(d) {
					return '#ffa9d2';
				},
				'opacity': 0.2,
				'radius'(d) {
					if (d.getProperties().root) { return 20; } return 10;
				},
			},
		},
		'nodeTypes': { 'type':
					[ 'solved', 'unsolved', ],
		},
		'rootNodeRadius': 70,
	};
	// start alchemy
	config.dataSource = {
		'edges': my_graph.reduce((acc, targets, source_idx) => { // source problem number = source_idx + 1
			if (typeof targets !== 'undefined') { // my_graph is sparse
				targets.forEach(target => acc.push({
					'source': source_idx + 1,
					target,
				}));
			}
			return acc;
		}, []),
		'nodes': Array.from(problems_to_show).reduce((acc, problem_s_children, problem_idx) => { // add 1 to problem_idx to get the problem number
			if (typeof problem_s_children !== 'undefined') { // my_graph is sparse
				acc.push({
					'id': problem_idx + 1,
					'name': problem_idx + 1,
					'root': !problem_idx, // node_idx === 0
					'type': problem_s_children.length ? 'solved' : 'unsolved', // if there are children, it's solved
				});
			}
			return acc;
		}, []),
	};
	// eslint-disable-next-line no-undef
	alchemy.begin(config);
})().catch((reason) => {
	console.log(reason);
});
