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

declare interface NodeType {
	root: boolean;
	id: number;
	name: number;
	type: 'solved' | 'unsolved';
}
declare interface AlchemyType {
	begin(config: Record<string, any>): void;
}
declare const alchemy: AlchemyType;

const get_problem_data = async (): Promise<number[][]> => {
	if (typeof Cookies.get('user_string') === 'undefined') {
		const problem_data = JSON.parse(localStorage.getItem('problems'));
		if (
			problem_data === null
			|| !Array.isArray(problem_data)
			|| problem_data.length !== 2
			|| !Array.isArray(problem_data[0])
			|| !Array.isArray(problem_data[1])
		) {
			// problem data is invalid
			localStorage.removeItem('problems');
			return [ [ 1, ], [], ];
		}
		return problem_data;
	}
	return fetch('/user_problems').then(data => data.json());
};

(async () => {
	const [ [ my_problems, my_solved_problems, ], global_graph, ]: [number[][], number[][]] = await Promise.all([
		get_problem_data(),
		fetch('/graph.json').then(data => data.json()),
	]);
	const my_problems_set = new Set(my_problems);
	const my_solved_problems_set = new Set(my_solved_problems);
	const my_graph: number[][] = [];
	for (const problem of my_problems) {
		my_graph[problem - 1] = global_graph[problem - 1].filter(Set.prototype.has, my_problems_set); // index is 1 less than problem number
	}
	const config: Record<string, any> = {
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
		'nodeCaption': (node: NodeType) => {
			return `Problem  ${node.name}`;
		},
		'nodeCaptionsOnByDefault': true,
		'nodeRadius': 20,
		'nodeStyle': {
			'solved': {
				'borderColor': 'none',
				'color': '#9b4dca',
				'radius'(d: { getProperties(): NodeType }) {
					if (d.getProperties().root) { return 20; } return 10;
				},
			},
			'unsolved': {
				'borderColor': 'none',
				'color': '#ffa9d2',
				'opacity': 0.2,
				'radius'(d: { getProperties(): NodeType }) {
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
		'edges': my_graph.reduce((acc: {source: number, target: number}[], targets, source_idx: number) => { // source problem number = source_idx + 1
			if (typeof targets !== 'undefined') { // my_graph is sparse
				targets.filter(Set.prototype.has, my_problems_set).forEach(target => acc.push({
					'source': source_idx + 1,
					target,
				}));
			}
			return acc;
		}, []),
		'nodes': my_graph.reduce((acc: NodeType[], problem_s_children, problem_idx: number) => { // add 1 to problem_idx to get the problem number
			if (typeof problem_s_children !== 'undefined') { // my_graph is sparse
				acc.push({
					'id': problem_idx + 1,
					'name': problem_idx + 1,
					'root': !problem_idx, // node_idx === 0
					'type': my_solved_problems_set.has(problem_idx + 1) ? 'solved' : 'unsolved', // if there are children, it's solved
				});
			}
			return acc;
		}, []),
	};
	alchemy.begin(config);
})().catch((reason) => {
	console.log(reason);
});
