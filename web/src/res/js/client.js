'use strict';

(async () => {
	const get_problems = async function() {
		const response = await fetch('/user_problems');
		return response.json();
	};

	if (localStorage.getItem('problems') === null) {
		const problems = await get_problems();
		localStorage.setItem('problems', JSON.stringify(problems));
	}
})().catch((reason) => {
	console.log(reason);
});

(async () => {
	const get_graph = async function() {
		const response = await fetch('/graph');
		return response.json();
	};
	const global_graph = await get_graph();
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
	const nodesToJson = function(nodes) {
		const graph = [];
		for (let x = 0; x < global_graph.length; x++) {
			if (nodes.includes(x + 1)) {
				graph.push([]);
				if (x < global_graph.length) {
					for (let y = 0; y < global_graph[x].length; y++) {
						if (nodes.includes(global_graph[x][y])) {
							graph[x].push(global_graph[x][y]);
						}
					}
				}
			}
		}
		const jsonGraph = {
			'edges': [],
			'nodes': [],
		};
		// push all the individual nodes into the jsonGraph
		for (let x = 0; x < nodes.length; x++) {
			jsonGraph.nodes.push(
				{
					'id': nodes[x],
					'name': nodes[x],
				}
			);
			if (nodes[x] === 1) {
				jsonGraph.nodes[jsonGraph.nodes.length - 1].root = true;
			}
			if (graph[nodes[x] - 1].length === 0) {
				jsonGraph.nodes[jsonGraph.nodes.length - 1].type = 'unsolved';
			} else {
				jsonGraph.nodes[jsonGraph.nodes.length - 1].type = 'solved';
			}
		}
		// push all the individual edges into the jsonGraph
		for (let x = 0; x < graph.length; x++) {
			for (let y = 0; y < graph[x].length; y++) {
				jsonGraph.edges.push(
					{
						'source': x + 1,
						'target': graph[x][y],
					}
				);
			}
		}
		// return the built json
		return jsonGraph;
	};
	// start alchemy
	//const nodes = JSON.parse(localStorage.getItem('problems'));
	const nodes = [1,2,3];
	config.dataSource = nodesToJson(nodes);
	// eslint-disable-next-line no-undef
	alchemy.begin(config);

})().catch((reason) => {
	console.log(reason);
});

