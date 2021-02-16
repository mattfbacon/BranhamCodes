'use strict';

(async () => {
	const get_problems = async function() {
		const response = await fetch('/user_problems');
		return response.json();
	};

	if (localStorage.getItem('problems') === null) {
		const problems = await get_problems();
		localStorage.setItem('problems', problems);
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
		'fixNodes': false,
		'fixRootNodes': true,
		'nodeCaption': (node) => {
			return `Problem  ${node.name}`;
		},
		'nodeCaptionsOnByDefault': true,
		'nodeRadius': 20,
		'nodeTypes': { 'type':
					[ 'solved', 'unsolved', ],
		},
		'rootNodeRadius': 70,
		'initialTranslate': [ 0, 0, ],
		'nodeStyle': {
			'solved': {
				'radius'(d) {
					if (d.getProperties().root) { return 20; } return 10;
				},
				'color'(d) {
					if (d.getProperties().root) { return '#0366fc'; } return '#68B9FE';
				},
				'borderColor': 'none',
			},
			'unsolved': {
				'radius'(d) {
					if (d.getProperties().root) { return 20; } return 10;
				},
				'color'(d) {
					return '#ff3333';
				},
				'borderColor': 'none',
				'opacity': 0.2,
			},
		},
		'edgeStyle': {
			'all': {
			  'width': 4,
			  'color': '#CCC',
			  'opacity': 0.2,
			  'selected': {
				},
			  'highlighted': {
					'color': '#CCC',
				},
			  'hidden': {
					'color': '#CCC',
				},
			},
		  },
	};
	let nodesToJson = function(nodes) {
		const nodes = [ 1, ];
		// gather all individual nodes from graph
		for (var x = 0; x < graph.length; x++) {
			for (var y = 0; y < graph[x].length; y++) {
				if (!nodes.includes(graph[x][y])) {
					nodes.push(graph[x][y]);
				}
			}
		}
		const jsonGraph = {
			'nodes': [],
			'edges': [],
		};
		// push all the individual nodes into the jsonGraph
		for (var x = 0; x < nodes.length; x++) {
			jsonGraph.nodes.push(
				{
					'name': nodes[x],
					'id': nodes[x],
				}
			);
			if (nodes[x] == 1) {
				jsonGraph.nodes[jsonGraph.nodes.length - 1].root = true;
			}
			if (graph[nodes[x] - 1].length == 0) {
				jsonGraph.nodes[jsonGraph.nodes.length - 1].type = 'unsolved';
			} else {
				jsonGraph.nodes[jsonGraph.nodes.length - 1].type = 'solved';
			}
		}
		// push all the individual edges into the jsonGraph
		for (var x = 0; x < graph.length; x++) {
			for (var y = 0; y < graph[x].length; y++) {
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
	}


})().catch((reason) => {
	console.log(reason);
});

