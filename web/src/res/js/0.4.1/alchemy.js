'use strict';

/* eslint-disable */

(function() {
	let Alchemy, Clustering, DrawEdge, DrawEdges, DrawNode, DrawNodes, Editor, EditorInteractions, EditorUtils, Layout, root, warnings,
		__slice = [].slice,
		__bind = function(fn, me) { return function() { return fn.apply(me, arguments); }; };

	Alchemy = (function() {
		function Alchemy(userConf) {
			if (userConf == null) {
				userConf = null;
			}
			this.a = this;
			this.version = '0.4.1';
			this.get = new this.Get(this);
			this.remove = new this.Remove(this);
			this.create = new this.Create(this);
			this.set = new this.Set(this);
			this.drawing = {
				'DrawEdge': DrawEdge(this),
				'DrawEdges': DrawEdges(this),
				'DrawNode': DrawNode(this),
				'DrawNodes': DrawNodes(this),
				'EdgeUtils': this.EdgeUtils(this),
				'NodeUtils': this.NodeUtils(this),
			};
			this.controlDash = this.controlDash(this);
			this.stats = this.stats(this);
			this.layout = Layout;
			this.clustering = Clustering;
			this.models = {
				'Node': this.Node(this),
				'Edge': this.Edge(this),
			};
			this.utils = {
				'warnings': new warnings(this),
			};
			this.filters = this.filters(this);
			this.exports = this.exports(this);
			this.visControls = {};
			this.styles = {};
			this.editor = {};
			this.log = {};
			this.state = {
				'interactions': 'default',
				'layout': 'default',
			};
			this.startGraph = this.startGraph(this);
			this.updateGraph = this.updateGraph(this);
			this.generateLayout = this.generateLayout(this);
			this.svgStyles = this.svgStyles(this);
			this.interactions = this.interactions(this);
			this.search = this.search(this);
			this.plugins = this.plugins(this);
			this._nodes = {};
			this._edges = {};
			this.getNodes = this.get.getNodes;
			this.getEdges = this.get.getEdges;
			this.allNodes = this.get.allNodes;
			this.allEdges = this.get.allEdges;
			if (userConf) {
				this.begin(userConf);
			}
		}

		Alchemy.prototype.begin = function(userConf) {
			let conf;
			conf = this.setConf(userConf);
			Alchemy.prototype.instances.push(this);
			switch (typeof this.conf.dataSource) {
			case 'string':
				d3.json(this.a.conf.dataSource, this.a.startGraph);
				break;
			case 'object':
				this.a.startGraph(this.a.conf.dataSource);
			}
			this.plugins.init();
			return this;
		};

		Alchemy.prototype.setConf = function(userConf) {
			let key, val;
			if (userConf.theme != null) {
				userConf = _.merge(_.cloneDeep(this.defaults), this.a.themes[`${userConf.theme}`]);
			}
			for (key in userConf) {
				val = userConf[key];
				switch (key) {
				case 'clusterColors':
					userConf.clusterColours = val;
					break;
				case 'backgroundColor':
					userConf.backgroundColour = val;
					break;
				case 'nodeColor':
					userConf[nodeColour] = val;
				}
			}
			return this.a.conf = _.merge(_.cloneDeep(this.defaults), userConf);
		};

		Alchemy.prototype.instances = [];

		Alchemy.prototype.getInst = function(svg) {
			let instNumber;
			instNumber = parseInt(d3.select(svg).attr('alchInst'));
			return Alchemy.prototype.instances[instNumber];
		};

		return Alchemy;

	})();

	root = typeof exports !== 'undefined' && exports !== null ? exports : this;

	root.Alchemy = Alchemy;

	root.alchemy = {
		'begin'(config) {
			return root.alchemy = new Alchemy(config);
		},
	};

	Alchemy.prototype.Create = (function() {
		function Create(instance) {
			this.a = instance;
		}

		Create.prototype.nodes = function() {
			let _i, _len, a, n, nodeMap, nodeMaps, registerNode;
			nodeMap = arguments[0], nodeMaps = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
			a = this.a;
			registerNode = function(node) {
				let aNode;
				if (!a._nodes[node.id]) {
					aNode = new a.models.Node(node);
					a._nodes[node.id] = aNode;
					return [ aNode, ];
				}
				return console.warn(`A node with the id ${node.id} already exists.\nConsider using the @a.get.nodes() method to \nretrieve the node and then using the Node methods.`);

			};
			nodeMaps = _.union(nodeMaps, nodeMap);
			for (_i = 0, _len = nodeMaps.length; _i < _len; _i++) {
				n = nodeMaps[_i];
				registerNode(n);
			}
			if (this.a.initial) {
				return this.a.updateGraph();
			}
		};

		Create.prototype.edges = function() {
			let a, allEdges, edgeMap, edgeMaps, registerEdge;
			edgeMap = arguments[0], edgeMaps = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
			a = this.a;
			registerEdge = function(edge) {
				let aEdge, edgeArray;
				if (edge.id && !a._edges[edge.id]) {
					aEdge = new a.models.Edge(edge);
					a._edges[edge.id] = [ aEdge, ];
					return [ aEdge, ];
				} else if (edge.id && a._edges[edge.id]) {
					return console.warn(`An edge with that id ${someEdgeMap.id} already exists.\nConsider using the @a.get.edge() method to \nretrieve the edge and then using the Edge methods.\nNote: id's are not required for edges.  Alchemy will create\nan unlimited number of edges for the same source and target node.\nSimply omit 'id' when creating the edge.`);
				}
				edgeArray = a._edges[`${String(edge.source)}-${edge.target}`];
				if (edgeArray) {
					aEdge = new a.models.Edge(edge, edgeArray.length);
					edgeArray.push(aEdge);
					return [ aEdge, ];
				}
				aEdge = new a.models.Edge(edge, 0);
				a._edges[`${String(edge.source)}-${edge.target}`] = [ aEdge, ];
				return [ aEdge, ];


			};
			allEdges = _.uniq(_.flatten(arguments));
			_.each(allEdges, (e) => {
				return registerEdge(e);
			});
			if (this.a.initial) {
				return this.a.updateGraph();
			}
		};

		return Create;

	})();

	Alchemy.prototype.Get = function(instance) {
		return {
			'a': instance,
			'_el': [],
			'_elType': null,
			'_makeChain'(inp) {
				let returnedGet;
				returnedGet = this;
				returnedGet.__proto__ = [].__proto__;
				while (returnedGet.length) {
					returnedGet.pop();
				}
				_.each(inp, (e) => {
					return returnedGet.push(e);
				});
				return returnedGet;
			},
			'nodes'() {
				let a, allIDs, id, ids, nodeList;
				id = arguments[0], ids = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
				if (id != null) {
					allIDs = _.map(arguments, (arg) => {
						return String(arg);
					});
					a = this.a;
					nodeList = (function(a) {
						return _.filter(a._nodes, (val, key) => {
							if (_.contains(allIDs, key)) {
								return val;
							}
						});
					})(a);
				}
				this._elType = 'node';
				this._el = nodeList;
				return this._makeChain(nodeList);
			},
			'edges'() {
				let a, allIDs, edgeList, id, ids;
				id = arguments[0], ids = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
				if (id != null) {
					allIDs = _.map(arguments, (arg) => {
						return String(arg);
					});
					a = this.a;
					edgeList = (function(a) {
						return _.flatten(_.filter(a._edges, (val, key) => {
							if (_.contains(allIDs, key)) {
								return val;
							}
						}));
					})(a);
				}
				this._elType = 'edge';
				this._el = edgeList;
				return this._makeChain(edgeList);
			},
			'all'() {
				let a, elType;
				a = this.a;
				elType = this._elType;
				this._el = (function(elType) {
					switch (elType) {
					case 'node':
						return a.elements.nodes.val;
					case 'edge':
						return a.elements.edges.flat;
					}
				})(elType);
				return this._makeChain(this._el);
			},
			'elState'(state) {
				let elList;
				elList = _.filter(this._el, (e) => {
					return e._state === state;
				});
				this._el = elList;
				return this._makeChain(elList);
			},
			'state'(key) {
				if (this.a.state.key != null) {
					return this.a.state.key;
				}
			},
			'type'(type) {
				let elList;
				elList = _.filter(this._el, (e) => {
					return e._nodeType === type || e._edgeType === type;
				});
				this._el = elList;
				return this._makeChain(elList);
			},
			'activeNodes'() {
				return _.filter(this.a._nodes, (node) => {
					if (node._state === 'active') {
						return node;
					}
				});
			},
			'activeEdges'() {
				return _.filter(this.a.get.allEdges(), (edge) => {
					if (edge._state === 'active') {
						return edge;
					}
				});
			},
			'state'(key) {
				if (this.a.state.key != null) {
					return this.a.state.key;
				}
			},
			'clusters'() {
				let clusterMap, nodesByCluster;
				clusterMap = this.a.layout._clustering.clusterMap;
				nodesByCluster = {};
				_.each(clusterMap, function(key, value) {
					return nodesByCluster[value] = _.select(this.a.get.allNodes(), function(node) {
						return node.getProperties()[this.a.conf.clusterKey] === value;
					});
				});
				return nodesByCluster;
			},
			'clusterColours'() {
				let clusterColoursObject, clusterMap;
				clusterMap = this.a.layout._clustering.clusterMap;
				clusterColoursObject = {};
				_.each(clusterMap, function(key, value) {
					return clusterColoursObject[value] = this.a.conf.clusterColours[key % this.a.conf.clusterColours.length];
				});
				return clusterColoursObject;
			},
			'allEdges'() {
				return this.a.elements.nodes.flat;
			},
			'allNodes'(type) {
				if (type != null) {
					return _.filter(this.a._nodes, (n) => {
						if (n._nodeType === type) {
							return n;
						}
					});
				}
				return this.a.elements.nodes.val;

			},
			'getNodes'() {
				let a, id, ids;
				id = arguments[0], ids = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
				a = this.a;
				ids.push(id);
				return _.map(ids, (id) => {
					return a._nodes[id];
				});
			},
			'getEdges'(id, target) {
				let a, edge_id;
				if (id == null) {
					id = null;
				}
				if (target == null) {
					target = null;
				}
				a = this.a;
				if ((id != null) && (target != null)) {
					edge_id = `${String(id)}-${target}`;
					return this.a._edges[edge_id];
				} else if ((id != null) && (target == null)) {
					return this.a._nodes[id]._adjacentEdges;
				}
			},
		};
	};

	Alchemy.prototype.Remove = (function() {
		function Remove(instance) {
			this.a = instance;
		}

		Remove.prototype.nodes = function(nodeMap) {
			return _.each(nodeMap, (n) => {
				if (n._nodeType != null) {
					return n.remove();
				}
			});
		};

		Remove.prototype.edges = function(edgeMap) {
			return _.each(edgeMap, (e) => {
				if (e._edgeType != null) {
					return e.remove();
				}
			});
		};

		return Remove;

	})();

	Alchemy.prototype.Set = function(instance) {
		return {
			'a': instance,
			'state'(key, value) {
				return this.a.state.key = value;
			},
		};
	};

	Clustering = (function() {
		function Clustering(instance) {
			let _charge, _friction, _gravity, _linkDistancefn, _linkStrength, clustering, conf, nodes;
			this.a = instance;
			nodes = this.a._nodes;
			conf = this.a.conf;
			clustering = this;
			this.clusterKey = conf.clusterKey;
			this.identifyClusters(this.a);
			_charge = -500;
			_linkStrength = function(edge) {
				let sourceCluster, targetCluster;
				sourceCluster = nodes[edge.source.id]._properties[this.clusterKey];
				targetCluster = nodes[edge.target.id]._properties[this.clusterKey];
				if (sourceCluster === targetCluster) {
					return 0.15;
				}
				return 0;

			};
			_friction = function() {
				return 0.7;
			};
			_linkDistancefn = function(edge) {
				nodes = edge.self.a._nodes;
				if (nodes[edge.source.id]._properties.root || nodes[edge.target.id]._properties.root) {
					return 300;
				} else if (nodes[edge.source.id]._properties[this.clusterKey] === nodes[edge.target.id]._properties[this.clusterKey]) {
					return 10;
				}
				return 600;

			};
			_gravity = function(k) {
				return 8 * k;
			};
			this.layout = {
				'charge': _charge,
				'linkStrength'(edge) {
					return _linkStrength(edge);
				},
				'friction'() {
					return _friction();
				},
				'linkDistancefn'(edge) {
					return _linkDistancefn(edge);
				},
				'gravity'(k) {
					return _gravity(k);
				},
			};
		}

		Clustering.prototype.identifyClusters = function(a) {
			let _i, _ref, _results, clusters, nodes;
			nodes = a.elements.nodes.val;
			clusters = _.uniq(_.map(nodes, (node) => {
				return node.getProperties()[a.conf.clusterKey];
			}));
			return this.clusterMap = _.zipObject(clusters, (function() {
				_results = [];
				for (let _i = 0, _ref = clusters.length; _ref >= 0 ? _i <= _ref : _i >= _ref; _ref >= 0 ? _i++ : _i--) { _results.push(_i); }
				return _results;
			}).apply(this));
		};

		Clustering.prototype.getClusterColour = function(clusterValue) {
			let index;
			index = this.clusterMap[clusterValue] % this.a.conf.clusterColours.length;
			return this.a.conf.clusterColours[index];
		};

		Clustering.prototype.edgeGradient = function(edges) {
			let Q, _i, _len, _ref, _results, defs, edge, endColour, gradient, gradient_id, id, ids, nodes, startColour;
			defs = this.a.vis.select(`${String(this.a.conf.divSelector)} svg`);
			Q = {};
			nodes = this.a._nodes;
			_ref = _.map(edges, (edge) => {
				return edge._d3;
			});
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				edge = _ref[_i];
				if (nodes[edge.source.id]._properties.root || nodes[edge.target.id]._properties.root) {
					continue;
				}
				if (nodes[edge.source.id]._properties[this.clusterKey] === nodes[edge.target.id]._properties[this.clusterKey]) {
					continue;
				}
				if (nodes[edge.target.id]._properties[this.clusterKey] !== nodes[edge.source.id]._properties[this.clusterKey]) {
					id = `${nodes[edge.source.id]._properties[this.clusterKey]}-${nodes[edge.target.id]._properties[this.clusterKey]}`;
					if (id in Q) {
						continue;
					} else if (!(id in Q)) {
						startColour = this.getClusterColour(nodes[edge.target.id]._properties[this.clusterKey]);
						endColour = this.getClusterColour(nodes[edge.source.id]._properties[this.clusterKey]);
						Q[id] = {
							startColour,
							endColour,
						};
					}
				}
			}
			_results = [];
			for (ids in Q) {
				gradient_id = `cluster-gradient-${ids}`;
				gradient = defs.append('svg:linearGradient').attr('id', gradient_id);
				gradient.append('svg:stop').attr('offset', '0%').attr('stop-color', Q[ids].startColour);
				_results.push(gradient.append('svg:stop').attr('offset', '100%').attr('stop-color', Q[ids].endColour));
			}
			return _results;
		};

		return Clustering;

	})();

	Alchemy.prototype.clusterControls = {
		'init'() {
			let changeClusterHTML;
			changeClusterHTML = '<input class=\'form-control form-inline\' id=\'cluster-key\' placeholder="Cluster Key"></input>';
			this.a.dash.select('#clustering-container').append('div').attr('id', 'cluster-key-container').attr('class', 'property form-inline form-group').html(changeClusterHTML)
				.style('display', 'none');
			this.a.dash.select('#cluster_control_header').on('click', function() {
				let display, element;
				element = this.a.dash.select('#cluster-key-container');
				return display = element.style('display');
			});
			element.style('display', (e) => {
				if (display === 'block') {
					return 'none';
				}
				return 'block';

			});
			if (this.a.dash.select('#cluster-key-container').style('display') === 'none') {
				this.a.dash.select('#cluster-arrow').attr('class', 'fa fa-2x fa-caret-right');
			} else {
				this.a.dash.select('#cluster-arrow').attr('class', 'fa fa-2x fa-caret-down');
			}
			return this.a.dash.select('#cluster-key').on('keydown', function() {
				if (d3.event.keyIdentifier === 'Enter') {
					this.a.conf.cluster = true;
					this.a.conf.clusterKey = this.value;
					return this.a.generateLayout();
				}
			});
		},
	};

	Alchemy.prototype.controlDash = function(instance) {
		let a;
		a = instance;
		return {
			'init'() {
				let divSelector;
				if (this.dashIsShown()) {
					divSelector = a.conf.divSelector;
					a.dash = d3.select(`${divSelector}`).append('div').attr('id', 'control-dash-wrapper').attr('class', 'col-md-4 initial');
					a.dash.append('i').attr('id', 'dash-toggle').attr('class', 'fa fa-flask col-md-offset-12');
					a.dash.append('div').attr('id', 'control-dash').attr('class', 'col-md-12');
					a.dash.select('#dash-toggle').on('click', a.interactions.toggleControlDash);
					a.controlDash.zoomCtrl();
					a.controlDash.search();
					a.controlDash.filters();
					a.controlDash.stats();
					a.controlDash.clustering();
					return a.controlDash.exports();
				}
			},
			'search'() {
				if (a.conf.search) {
					a.dash.select('#control-dash').append('div').attr('id', 'search').html('<div class=\'input-group\'>\n    <input class=\'form-control\' placeholder=\'Search\'>\n    <i class=\'input-group-addon search-icon\'><span class=\'fa fa-search fa-1x\'></span></i>\n</div> ');
					return a.search.init();
				}
			},
			'zoomCtrl'() {
				if (a.conf.zoomControls) {
					a.dash.select('#control-dash-wrapper').append('div').attr('id', 'zoom-controls').attr('class', 'col-md-offset-12').html('<button id=\'zoom-reset\'  class=\'btn btn-defualt btn-primary\'><i class=\'fa fa-crosshairs fa-lg\'></i></button> <button id=\'zoom-in\'  class=\'btn btn-defualt btn-primary\'><i class=\'fa fa-plus\'></i></button> <button id=\'zoom-out\' class=\'btn btn-default btn-primary\'><i class=\'fa fa-minus\'></i></button>');
					a.dash.select('#zoom-in').on('click', () => {
						return a.interactions.clickZoom('in');
					});
					a.dash.select('#zoom-out').on('click', () => {
						return a.interactions.clickZoom('out');
					});
					return a.dash.select('#zoom-reset').on('click', () => {
						return a.interactions.clickZoom('reset');
					});
				}
			},
			'filters'() {
				if (a.conf.nodeFilters || a.conf.edgeFilters) {
					a.dash.select('#control-dash').append('div').attr('id', 'filters');
					return a.filters.init();
				}
			},
			'stats'() {
				let stats_html;
				if (a.conf.nodeStats || a.conf.edgeStats) {
					stats_html = '<div id = "stats-header" data-toggle="collapse" data-target="#stats #all-stats">\n<h3>\n    Statistics\n</h3>\n<span class = "fa fa-caret-right fa-2x"></span>\n</div>\n<div id="all-stats" class="collapse">\n    <ul class = "list-group" id="node-stats"></ul>\n    <ul class = "list-group" id="rel-stats"></ul>  \n</div>';
					a.dash.select('#control-dash').append('div').attr('id', 'stats').html(stats_html).select('#stats-header')
						.on('click', () => {
							if (a.dash.select('#all-stats').classed('in')) {
								return a.dash.select('#stats-header>span').attr('class', 'fa fa-2x fa-caret-right');
							}
							return a.dash.select('#stats-header>span').attr('class', 'fa fa-2x fa-caret-down');

						});
					return a.stats.init();
				}
			},
			'exports'() {
				let exports_html;
				if (a.conf.exportSVG) {
					exports_html = '<div id="exports-header" data-toggle="collapse" data-target="#all-exports" style="padding:10px;">\n    <h3>\n        Exports\n    </h3>\n    <span class="fa fa-caret-right fa-2x"></span>\n</div>\n<div id="all-exports" class="collapse"></div>';
					a.dash.select('#control-dash').append('div').attr('id', 'exports').attr('style', 'padding: 0.5em 1em; border-bottom: thin dashed #E89619; color: white;').html(exports_html)
						.select('#exports-header');
					return a.exports.init();
				}
			},
			'clustering'() {
				let clusterControl_html;
				if (a.conf.clusterControl) {
					clusterControl_html = '<div id="clustering-container">\n    <div id="cluster_control_header" data-toggle="collapse" data-target="#clustering #cluster-options">\n         <h3>Clustering</h3>\n        <span id="cluster-arrow" class="fa fa-2x fa-caret-right"></span>\n    </div>\n</div>';
					a.dash.select('#control-dash').append('div').attr('id', 'clustering').html(clusterControl_html).select('#cluster_control_header');
					return a.clusterControls.init();
				}
			},
			'dashIsShown'() {
				let conf;
				conf = a.conf;
				return conf.showEditor || conf.captionToggle || conf.toggleRootNodes || conf.removeElement || conf.clusterControl || conf.nodeStats || conf.edgeStats || conf.edgeFilters || conf.nodeFilters || conf.edgesToggle || conf.nodesToggle || conf.search || conf.exportSVG;
			},
		};
	};

	Alchemy.prototype.filters = (function(_this) {
		return function(instance) {
			let a;
			a = instance;
			return {
				'init'() {
					let _i, _j, _len, _len1, _ref, caption, edgeType, edgeTypes, nodeKey, nodeType, nodeTypes, types;
					a.filters.show();
					if (a.conf.edgeFilters) {
						a.filters.showEdgeFilters();
					}
					if (a.conf.nodeFilters) {
						a.filters.showNodeFilters();
					}
					if (a.conf.nodeTypes) {
						nodeKey = Object.keys(a.conf.nodeTypes);
						nodeTypes = '';
						_ref = a.conf.nodeTypes[nodeKey];
						for (_i = 0, _len = _ref.length; _i < _len; _i++) {
							nodeType = _ref[_i];
							caption = nodeType.replace('_', ' ');
							nodeTypes += `<li class='list-group-item nodeType' role='menuitem' id='li-${nodeType}' name=${nodeType}>${caption}</li>`;
						}
						a.dash.select('#node-dropdown').html(nodeTypes);
					}
					if (a.conf.edgeTypes) {
						if (_.isPlainObject(a.conf.edgeTypes)) {
							types = _.values(a.conf.edgeTypes)[0];
						} else {
							types = a.conf.edgeTypes;
						}
						edgeTypes = '';
						for (_j = 0, _len1 = types.length; _j < _len1; _j++) {
							edgeType = types[_j];
							caption = edgeType.replace('_', ' ');
							edgeTypes += `<li class='list-group-item edgeType' role='menuitem' id='li-${edgeType}' name=${edgeType}>${caption}</li>`;
						}
						a.dash.select('#rel-dropdown').html(edgeTypes);
					}
					if (a.conf.captionsToggle) {
						a.filters.captionsToggle();
					}
					if (a.conf.edgesToggle) {
						a.filters.edgesToggle();
					}
					if (a.conf.nodesToggle) {
						a.filters.nodesToggle();
					}
					return a.filters.update();
				},
				'show'() {
					let filter_html;
					filter_html = '<div id = "filter-header" data-toggle="collapse" data-target="#filters form">\n    <h3>Filters</h3>\n    <span class = "fa fa-2x fa-caret-right"></span>\n</div>\n    <form class="form-inline collapse">\n    </form>';
					a.dash.select('#control-dash #filters').html(filter_html);
					a.dash.selectAll('#filter-header').on('click', () => {
						if (a.dash.select('#filters>form').classed('in')) {
							return a.dash.select('#filter-header>span').attr('class', 'fa fa-2x fa-caret-right');
						}
						return a.dash.select('#filter-header>span').attr('class', 'fa fa-2x fa-caret-down');

					});
					return a.dash.select('#filters form');
				},
				'showEdgeFilters'() {
					let rel_filter_html;
					rel_filter_html = '<div id="filter-rel-header" data-target = "#rel-dropdown" data-toggle="collapse">\n    <h4>\n        Edge Types\n    </h4>\n    <span class="fa fa-lg fa-caret-right"></span>\n</div>\n<ul id="rel-dropdown" class="collapse list-group" role="menu">\n</ul>';
					a.dash.select('#filters form').append('div').attr('id', 'filter-relationships').html(rel_filter_html);
					return a.dash.select('#filter-rel-header').on('click', () => {
						if (a.dash.select('#rel-dropdown').classed('in')) {
							return a.dash.select('#filter-rel-header>span').attr('class', 'fa fa-lg fa-caret-right');
						}
						return a.dash.select('#filter-rel-header>span').attr('class', 'fa fa-lg fa-caret-down');

					});
				},
				'showNodeFilters'() {
					let node_filter_html;
					node_filter_html = '<div id="filter-node-header" data-target = "#node-dropdown" data-toggle="collapse">\n    <h4>\n        Node Types\n    </h4>\n    <span class="fa fa-lg fa-caret-right"></span>\n</div>\n<ul id="node-dropdown" class="collapse list-group" role="menu">\n</ul>';
					a.dash.select('#filters form').append('div').attr('id', 'filter-nodes').html(node_filter_html);
					return a.dash.select('#filter-node-header').on('click', () => {
						if (a.dash.select('#node-dropdown').classed('in')) {
							return a.dash.select('#filter-node-header>span').attr('class', 'fa fa-lg fa-caret-right');
						}
						return a.dash.select('#filter-node-header>span').attr('class', 'fa fa-lg fa-caret-down');

					});
				},
				'captionsToggle'() {
					return a.dash.select('#filters form').append('li').attr({
						'id': 'toggle-captions',
						'class': 'list-group-item active-label toggle',
					}).html('Show Captions').on('click', () => {
						let isDisplayed;
						isDisplayed = a.dash.select('g text').attr('style');
						if (isDisplayed === 'display: block' || null) {
							return a.dash.selectAll('g text').attr('style', 'display: none');
						}
						return a.dash.selectAll('g text').attr('style', 'display: block');

					});
				},
				'edgesToggle'() {
					return a.dash.select('#filters form').append('li').attr({
						'id': 'toggle-edges',
						'class': 'list-group-item active-label toggle',
					}).html('Toggle Edges').on('click', () => {
						if (_.contains(_.pluck(_.flatten(_.values(a._edges)), '_state'), 'active')) {
							return _.each(_.values(a._edges), (edges) => {
								return _.each(edges, (e) => {
									if (e._state === 'active') {
										return e.toggleHidden();
									}
								});
							});
						}
						return _.each(_.values(a._edges), (edges) => {
							return _.each(edges, (e) => {
								let source, target;
								source = a._nodes[e._properties.source];
								target = a._nodes[e._properties.target];
								if (source._state === 'active' && target._state === 'active') {
									return e.toggleHidden();
								}
							});
						});

					});
				},
				'nodesToggle'() {
					return a.dash.select('#filters form').append('li').attr({
						'id': 'toggle-nodes',
						'class': 'list-group-item active-label toggle',
					}).html('Toggle Nodes').on('click', () => {
						let nodes;
						nodes = _.values(a._nodes);
						if (_.contains(_.pluck(nodes, '_state'), 'active')) {
							return _.each(nodes, (n) => {
								if (a.conf.toggleRootNodes && n._d3.root) {
									return;
								}
								if (n._state === 'active') {
									return n.toggleHidden();
								}
							});
						}
						return _.each(_.values(a._nodes), (n) => {
							if (a.conf.toggleRootNodes && n._d3.root) {
								return;
							}
							return n.toggleHidden();
						});

					});
				},
				'update'() {
					return a.dash.selectAll('.nodeType, .edgeType').on('click', function() {
						let element, tag;
						element = d3.select(this);
						tag = element.attr('name');
						a.vis.selectAll(`.${tag}`).each((d) => {
							let edge, node, source, target;
							if (a._nodes[d.id] != null) {
								node = a._nodes[d.id];
								return node.toggleHidden();
							}
							edge = a._edges[d.id][0];
							source = a._nodes[edge._properties.source];
							target = a._nodes[edge._properties.target];
							if (source._state === 'active' && target._state === 'active') {
								return edge.toggleHidden();
							}

						});
						return a.stats.nodeStats();
					});
				},
			};
		};
	})(this);

	Alchemy.prototype.Index = function(instance, all) {
		let a, edges, elements, nodes;
		a = instance;
		elements = {
			'nodes': {
				'val': (function() {
					return _.values(a._nodes);
				})(),
			},
			'edges': {
				'val': (function() {
					return _.values(a._edges);
				})(),
			},
		};
		nodes = elements.nodes;
		edges = elements.edges;
		elements.edges.flat = (function() {
			return _.flatten(edges.val);
		})();
		elements.nodes.d3 = (function() {
			return _.map(nodes.val, (n) => {
				return n._d3;
			});
		})();
		elements.edges.d3 = (function() {
			return _.map(edges.flat, (e) => {
				return e._d3;
			});
		})();
		a.elements = elements;
		return function() {
			a.elements.nodes.svg = (function() {
				return a.vis.selectAll('g.node');
			})();
			return a.elements.edges.svg = (function() {
				return a.vis.selectAll('g.edge');
			})();
		};
	};

	Alchemy.prototype.interactions = function(instance) {
		let a;
		a = instance;
		return {
			'edgeClick'(d) {
				let edge;
				if (d3.event.defaultPrevented) {
					return;
				}
				d3.event.stopPropagation();
				edge = d.self;
				if (typeof a.conf.edgeClick === 'function') {
					a.conf.edgeClick(edge);
				}
				if (edge._state !== 'hidden') {
					edge._state = (function() {
						if (edge._state === 'selected') {
							return 'active';
						}
						return 'selected';
					})();
					return edge.setStyles();
				}
			},
			'edgeMouseOver'(d) {
				let edge;
				edge = d.self;
				if (edge._state !== 'hidden') {
					if (edge._state !== 'selected') {
						edge._state = 'highlighted';
					}
					return edge.setStyles();
				}
			},
			'edgeMouseOut'(d) {
				let edge;
				edge = d.self;
				if (edge._state !== 'hidden') {
					if (edge._state !== 'selected') {
						edge._state = 'active';
					}
					return edge.setStyles();
				}
			},
			'nodeMouseOver'(n) {
				let node;
				node = n.self;
				if (node._state !== 'hidden') {
					if (node._state !== 'selected') {
						node._state = 'highlighted';
						node.setStyles();
					}
					if (typeof a.conf.nodeMouseOver === 'function') {
						return a.conf.nodeMouseOver(node);
					} else if (typeof a.conf.nodeMouseOver === ('number' || 'string')) {
						return node.properties[a.conf.nodeMouseOver];
					}
				}
			},
			'nodeMouseOut'(n) {
				let node;
				node = n.self;
				a = node.a;
				if (node._state !== 'hidden') {
					if (node._state !== 'selected') {
						node._state = 'active';
						node.setStyles();
					}
					if ((a.conf.nodeMouseOut != null) && typeof a.conf.nodeMouseOut === 'function') {
						return a.conf.nodeMouseOut(n);
					}
				}
			},
			'nodeClick'(n) {
				let node;
				// handle problem clicks
				if (d3.event.defaultPrevented) {
					return;
				}
				d3.event.stopPropagation();
				node = n.self;
				if (typeof a.conf.nodeClick === 'function') {
					a.conf.nodeClick(node);
				}
				if (node._state !== 'hidden') {
					const problem = (n.id).toString();
					console.log(problem);
					window.location.replace(`/problems/${problem}.html`);
					node._state = (function() {
						if (node._state === 'selected') {
							return 'active';
						}
						return 'selected';
					})();
					return node.setStyles();
				}
			},
			'zoom'(extent) {
				if (this._zoomBehavior == null) {
					this._zoomBehavior = d3.behavior.zoom();
				}
				return this._zoomBehavior.scaleExtent(extent).on('zoom', function(d) {
					a = Alchemy.prototype.getInst(this);
					return a.vis.attr('transform', `translate(${d3.event.translate}) scale(${d3.event.scale})`);
				});
			},
			'clickZoom'(direction) {
				let _ref, scale, x, y;
				_ref = a.vis.attr('transform').match(/(-*\d+\.*\d*)/g).map((a) => {
					return parseFloat(a);
				}), x = _ref[0], y = _ref[1], scale = _ref[2];
				a.vis.attr('transform', () => {
					if (direction === 'in') {
						if (scale < a.conf.scaleExtent[1]) {
							scale += 0.2;
						}
						return `translate(${x},${y}) scale(${scale})`;
					} else if (direction === 'out') {
						if (scale > a.conf.scaleExtent[0]) {
							scale -= 0.2;
						}
						return `translate(${x},${y}) scale(${scale})`;
					} else if (direction === 'reset') {
						return 'translate(0,0) scale(1)';
					}
					return console.log('error');

				});
				if (this._zoomBehavior == null) {
					this._zoomBehavior = d3.behavior.zoom();
				}
				return this._zoomBehavior.scale(scale).translate([ x, y, ]);
			},
			'nodeDragStarted'(d, i) {
				d3.event.preventDefault;
				d3.event.sourceEvent.stopPropagation();
				d3.select(this).classed('dragging', true);
				return d.fixed = true;
			},
			'nodeDragged'(d, i) {
				let edges, node;
				a = d.self.a;
				d.x += d3.event.dx;
				d.y += d3.event.dy;
				d.px += d3.event.dx;
				d.py += d3.event.dy;
				node = d3.select(this);
				node.attr('transform', `translate(${d.x}, ${d.y})`);
				edges = d.self._adjacentEdges;
				return _.each(edges, (edge) => {
					let selection;
					selection = a.vis.select(`#edge-${edge.id}-${edge._index}`);
					return a._drawEdges.updateEdge(selection.data()[0]);
				});
			},
			'nodeDragended'(d, i) {
				a = d.self.a;
				d3.select(this).classed({
					'dragging': false,
				});
				if (!a.conf.forceLocked) {
					return a.force.start();
				}
			},
			'nodeDoubleClick'(d) {
				return null;
			},
			'deselectAll'() {
				let _ref;
				a = Alchemy.prototype.getInst(this);
				if ((_ref = d3.event) != null ? _ref.defaultPrevented : void 0) {
					return;
				}
				if (a.conf.showEditor === true) {
					a.modifyElements.nodeEditorClear();
				}
				_.each(a._nodes, (n) => {
					n._state = 'active';
					return n.setStyles();
				});
				_.each(a._edges, (edge) => {
					return _.each(edge, (e) => {
						e._state = 'active';
						return e.setStyles();
					});
				});
				if (a.conf.deselectAll && typeof (a.conf.deselectAll === 'function')) {
					return a.conf.deselectAll();
				}
			},
		};
	};

	Layout = (function() {
		function Layout(instance) {
			this.tick = __bind(this.tick, this);
			this.linkStrength = __bind(this.linkStrength, this);
			this.gravity = __bind(this.gravity, this);
			let a, conf, nodes;
			this.a = a = instance;
			conf = this.a.conf;
			nodes = this.a._nodes;
			this.k = Math.sqrt(Math.log(_.size(this.a._nodes)) / (conf.graphWidth() * conf.graphHeight()));
			this._clustering = new this.a.clustering(this.a);
			this.d3NodeInternals = a.elements.nodes.d3;
			if (conf.cluster) {
				this._charge = function() {
					return this._clustering.layout.charge;
				};
				this._linkStrength = function(edge) {
					return this._clustering.layout.linkStrength(edge);
				};
			} else {
				this._charge = function() {
					return -10 / this.k;
				};
				this._linkStrength = function(edge) {
					if (nodes[edge.source.id].getProperties('root') || nodes[edge.target.id].getProperties('root')) {
						return 1;
					}
					return 0.9;

				};
			}
			if (conf.cluster) {
				this._linkDistancefn = function(edge) {
					return this._clustering.layout.linkDistancefn(edge);
				};
			} else if (conf.linkDistancefn === 'default') {
				this._linkDistancefn = function(edge) {
					return 1 / (this.k * 50);
				};
			} else if (typeof conf.linkDistancefn === 'number') {
				this._linkDistancefn = function(edge) {
					return conf.linkDistancefn;
				};
			} else if (typeof conf.linkDistancefn === 'function') {
				this._linkDistancefn = function(edge) {
					return conf.linkDistancefn(edge);
				};
			}
		}

		Layout.prototype.gravity = function() {
			if (this.a.conf.cluster) {
				return this._clustering.layout.gravity(this.k);
			}
			return 50 * this.k;

		};

		Layout.prototype.linkStrength = function(edge) {
			return this._linkStrength(edge);
		};

		Layout.prototype.friction = function() {
			return 0.9;
		};

		Layout.prototype.collide = function(node) {
			let conf, nx1, nx2, ny1, ny2, r;
			conf = this.a.conf;
			r = 2 * (node.radius + node['stroke-width']) + conf.nodeOverlap;
			nx1 = node.x - r;
			nx2 = node.x + r;
			ny1 = node.y - r;
			ny2 = node.y + r;
			return function(quad, x1, y1, x2, y2) {
				let l, x, y;
				if (quad.point && (quad.point !== node)) {
					x = node.x - Math.abs(quad.point.x);
					y = node.y - quad.point.y;
					l = Math.sqrt(x * x + y * y);
					r = r;
					if (l < r) {
						l = (l - r) / l * conf.alpha;
						node.x -= x *= l;
						node.y -= y *= l;
						quad.point.x += x;
						quad.point.y += y;
					}
				}
				return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
			};
		};

		Layout.prototype.tick = function(draw) {
			let _i, _len, _ref, a, edges, node, nodes, q;
			a = this.a;
			nodes = a.elements.nodes.svg;
			edges = a.elements.edges.svg;
			if (a.conf.collisionDetection) {
				q = d3.geom.quadtree(this.d3NodeInternals);
				_ref = this.d3NodeInternals;
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					node = _ref[_i];
					q.visit(this.collide(node));
				}
			}
			nodes.attr('transform', (d) => {
				return `translate(${d.x},${d.y})`;
			});
			this.drawEdge = a.drawing.DrawEdge;
			this.drawEdge.styleText(edges);
			return this.drawEdge.styleLink(edges);
		};

		Layout.prototype.positionRootNodes = function() {
			let _i, _len, _ref, _ref1, _results, conf, container, i, n, rootNodes;
			conf = this.a.conf;
			container = {
				'width': conf.graphWidth(),
				'height': conf.graphHeight(),
			};
			rootNodes = _.filter(this.a.elements.nodes.val, (node) => {
				return node.getProperties('root');
			});
			if (rootNodes.length === 1) {
				n = rootNodes[0];
				_ref = [ container.width / 2, container.width / 2, ], n._d3.x = _ref[0], n._d3.px = _ref[1];
				_ref1 = [ container.height / 2, container.height / 2, ], n._d3.y = _ref1[0], n._d3.py = _ref1[1];
				n._d3.fixed = true;
			} else {
				_results = [];
				for (i = _i = 0, _len = rootNodes.length; _i < _len; i = ++_i) {
					n = rootNodes[i];
					n._d3.x = container.width / Math.sqrt(rootNodes.length * (i + 1));
					n._d3.y = container.height / 2;
					_results.push(n._d3.fixed = true);
				}
				return _results;
			}
		};

		Layout.prototype.chargeDistance = function() {
			return 500;
		};

		Layout.prototype.linkDistancefn = function(edge) {
			return this._linkDistancefn(edge);
		};

		Layout.prototype.charge = function() {
			return this._charge();
		};

		return Layout;

	})();

	Alchemy.prototype.generateLayout = function(instance) {
		let a;
		a = instance;
		return function(start) {
			let conf;
			if (start == null) {
				start = false;
			}
			conf = a.conf;
			a.layout = new Layout(a);
			return a.force = d3.layout.force().size([ conf.graphWidth(), conf.graphHeight(), ]).theta(1.0).gravity(a.layout.gravity()).friction(a.layout.friction())
				.nodes(a.elements.nodes.d3)
				.links(a.elements.edges.d3)
				.linkDistance((link) => {
					return a.layout.linkDistancefn(link);
				})
				.linkStrength((link) => {
					return a.layout.linkStrength(link);
				})
				.charge(a.layout.charge())
				.chargeDistance(a.layout.chargeDistance());
		};
	};

	Alchemy.prototype.search = function(instance) {
		let a;
		a = instance;
		return {
			'init'() {
				let searchBox;
				searchBox = a.dash.select('#search input');
				return searchBox.on('keyup', () => {
					let input;
					input = searchBox[0][0].value.toLowerCase();
					a.vis.selectAll('.node').classed('inactive', false);
					a.vis.selectAll('text').attr('style', () => {
						if (input !== '') {
							return 'display: inline;';
						}
					});
					return a.vis.selectAll('.node').classed('inactive', function(node) {
						let DOMtext, hidden;
						DOMtext = d3.select(this).text();
						switch (a.conf.searchMethod) {
						case 'contains':
							hidden = DOMtext.toLowerCase().indexOf(input) < 0;
							break;
						case 'begins':
							hidden = DOMtext.toLowerCase().indexOf(input) !== 0;
						}
						if (hidden) {
							a.vis.selectAll(`[source-target*='${node.id}']`).classed('inactive', hidden);
						} else {
							a.vis.selectAll(`[source-target*='${node.id}']`).classed('inactive', (edge) => {
								let nodeIDs, sourceHidden, targetHidden;
								nodeIDs = [ edge.source.id, edge.target.id, ];
								sourceHidden = a.vis.select(`#node-${nodeIDs[0]}`).classed('inactive');
								targetHidden = a.vis.select(`#node-${nodeIDs[1]}`).classed('inactive');
								return targetHidden || sourceHidden;
							});
						}
						return hidden;
					});
				});
			},
		};
	};

	Alchemy.prototype.startGraph = function(instance) {
		let a;
		a = instance;
		return function(data) {
			let conf, d3Edges, d3Nodes, defs, editor, editorInteractions;
			conf = a.conf;
			if (d3.select(conf.divSelector).empty()) {
				console.warn(a.utils.warnings.divWarning());
			}
			if (!data) {
				data = {
					'nodes': [],
					'edges': [],
				};
				a.utils.warnings.dataWarning();
			}
			if (data.edges == null) {
				data.edges = [];
			}
			a.create.nodes(data.nodes);
			data.edges.forEach((e) => {
				return a.create.edges(e);
			});
			a.vis = d3.select(conf.divSelector).attr('style', `width:${conf.graphWidth()}px; height:${conf.graphHeight()}px; background:${conf.backgroundColour};`).append('svg').attr('xmlns', 'http://www.w3.org/2000/svg').attr('xlink', 'http://www.w3.org/1999/xlink')
				.attr('pointer-events', 'all')
				.attr('style', `background:${conf.backgroundColour};`)
				.attr('alchInst', Alchemy.prototype.instances.length - 1)
				.on('click', a.interactions.deselectAll)
				.call(a.interactions.zoom(conf.scaleExtent))
				.on('dblclick.zoom', null)
				.append('g')
				.attr('transform', `translate(${conf.initialTranslate}) scale(${conf.initialScale})`);
			a.interactions.zoom().scale(conf.initialScale);
			a.interactions.zoom().translate(conf.initialTranslate);
			a.index = Alchemy.prototype.Index(a);
			a.generateLayout();
			a.controlDash.init();
			d3Edges = a.elements.edges.d3;
			d3Nodes = a.elements.nodes.d3;
			a.layout.positionRootNodes();
			a.force.start();
			if (conf.forceLocked) {
				while (a.force.alpha() > 0.005) {
					a.force.tick();
				}
			}
			a._drawEdges = a.drawing.DrawEdges;
			a._drawNodes = a.drawing.DrawNodes;
			a._drawEdges.createEdge(d3Edges);
			a._drawNodes.createNode(d3Nodes);
			a.index();
			a.elements.nodes.svg.attr('transform', (id, i) => {
				return `translate(${id.x}, ${id.y})`;
			});
			console.log(`${Date()} completed initial computation`);
			if (!conf.forceLocked) {
				a.force.on('tick', a.layout.tick).start();
			}
			if (conf.afterLoad != null) {
				if (typeof conf.afterLoad === 'function') {
					conf.afterLoad();
				} else if (typeof conf.afterLoad === 'string') {
					a[conf.afterLoad] = true;
				}
			}
			if (conf.cluster) {
				defs = d3.select(`${String(a.conf.divSelector)} svg`).append('svg:defs');
			}
			if (conf.nodeStats) {
				a.stats.nodeStats();
			}
			if (conf.showEditor) {
				editor = new a.editor.Editor();
				editorInteractions = new a.editor.Interactions();
				d3.select('body').on('keydown', editorInteractions.deleteSelected);
				editor.startEditor();
			}
			return a.initial = true;
		};
	};

	Alchemy.prototype.stats = function(instance) {
		let a;
		a = instance;
		return {
			'init'() {
				return a.stats.update();
			},
			'nodeStats'() {
				let _i, _len, _ref, activeNodes, allNodes, caption, inactiveNodes, nodeData, nodeGraph, nodeKeys, nodeNum, nodeStats, nodeType, nodeTypes;
				nodeData = [];
				allNodes = a.get.allNodes().length;
				activeNodes = a.get.activeNodes().length;
				inactiveNodes = allNodes - activeNodes;
				nodeStats = `<li class = 'list-group-item gen_node_stat'>Number of nodes: <span class='badge'>${allNodes}</span></li> <li class = 'list-group-item gen_node_stat'>Number of active nodes: <span class='badge'>${activeNodes}</span></li> <li class = 'list-group-item gen_node_stat'>Number of inactive nodes: <span class='badge'>${inactiveNodes}</span></li></br>`;
				if (a.conf.nodeTypes) {
					nodeKeys = Object.keys(a.conf.nodeTypes);
					nodeTypes = '';
					_ref = a.conf.nodeTypes[nodeKeys];
					for (_i = 0, _len = _ref.length; _i < _len; _i++) {
						nodeType = _ref[_i];
						caption = nodeType.replace('_', ' ');
						nodeNum = a.vis.selectAll(`g.node.${nodeType}`)[0].length;
						nodeTypes += `<li class = 'list-group-item nodeType' id='li-${nodeType}' name = ${caption}>Number of <strong style='text-transform: uppercase'>${caption}</strong> nodes: <span class='badge'>${nodeNum}</span></li>`;
						nodeData.push([ `${nodeType}`, nodeNum, ]);
					}
					nodeStats += nodeTypes;
				}
				nodeGraph = '<li id=\'node-stats-graph\' class=\'list-group-item\'></li>';
				nodeStats += nodeGraph;
				a.dash.select('#node-stats').html(nodeStats);
				return this.insertSVG('node', nodeData);
			},
			'edgeStats'() {
				let _i, _len, activeEdges, allEdges, caption, edgeData, edgeGraph, edgeKeys, edgeNum, edgeStats, edgeType, edgeTypes, inactiveEdges;
				edgeData = [];
				allEdges = a.get.allEdges().length;
				activeEdges = a.get.activeEdges().length;
				inactiveEdges = allEdges - activeEdges;
				edgeStats = `<li class = 'list-group-item gen_edge_stat'>Number of relationships: <span class='badge'>${allEdges}</span></li> <li class = 'list-group-item gen_edge_stat'>Number of active relationships: <span class='badge'>${activeEdges}</span></li> <li class = 'list-group-item gen_edge_stat'>Number of inactive relationships: <span class='badge'>${inactiveEdges}</span></li></br>`;
				if (a.conf.edgeTypes) {
					edgeKeys = _.values(alchemy.conf.edgeTypes)[0];
					edgeTypes = '';
					for (_i = 0, _len = edgeKeys.length; _i < _len; _i++) {
						edgeType = edgeKeys[_i];
						if (!edgeType) {
							continue;
						}
						caption = edgeType.replace('_', ' ');
						edgeNum = _.filter(a.get.allEdges(), (edge) => {
							if (edge._edgeType === edgeType) {
								return edge;
							}
						}).length;
						edgeTypes += `<li class = 'list-group-item edgeType' id='li-${edgeType}' name = ${caption}>Number of <strong style='text-transform: uppercase'>${caption}</strong> relationships: <span class='badge'>${edgeNum}</span></li>`;
						edgeData.push([ `${caption}`, edgeNum, ]);
					}
					edgeStats += edgeTypes;
				}
				edgeGraph = '<li id=\'node-stats-graph\' class=\'list-group-item\'></li>';
				edgeStats += edgeGraph;
				a.dash.select('#rel-stats').html(edgeStats);
				return this.insertSVG('edge', edgeData);
			},
			'insertSVG'(element, data) {
				let arc, arcs, color, height, pie, radius, svg, width;
				if (data === null) {
					return a.dash.select(`#${element}-stats-graph`).html(`<br><h4 class='no-data'>There are no ${element}Types listed in your conf.</h4>`);
				}
				width = a.conf.graphWidth() * 0.25;
				height = 250;
				radius = width / 4;
				color = d3.scale.category20();
				arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(radius / 2);
				pie = d3.layout.pie().sort(null).value((d) => {
					return d[1];
				});
				svg = a.dash.select(`#${element}-stats-graph`).append('svg').append('g').style({
					width,
					height,
				}).attr('transform', `translate(${width / 2},${height / 2})`);
				arcs = svg.selectAll('.arc').data(pie(data)).enter().append('g').classed('arc', true)
					.on('mouseover', (d, i) => {
						return a.dash.select(`#${data[i][0]}-stat`).classed('hidden', false);
					})
					.on('mouseout', (d, i) => {
						return a.dash.select(`#${data[i][0]}-stat`).classed('hidden', true);
					});
				arcs.append('path').attr('d', arc).attr('stroke', (d, i) => {
					return color(i);
				}).attr('stroke-width', 2).attr('fill-opacity', '0.3');
				return arcs.append('text').attr('transform', (d) => {
					return `translate(${arc.centroid(d)})`;
				}).attr('id', (d, i) => {
					return `${String(data[i][0])}-stat`;
				}).attr('dy', '.35em').classed('hidden', true)
					.text((d, i) => {
						return data[i][0];
					});

			},
			'update'() {
				if (a.conf.nodeStats) {
					this.nodeStats();
				}
				if (a.conf.edgeStats) {
					return this.edgeStats();
				}
			},
		};
	};

	Alchemy.prototype.updateGraph = function(instance) {
		let a;
		a = instance;
		return function() {
			a.generateLayout();
			a._drawEdges.createEdge(a.elements.edges.d3);
			a._drawNodes.createNode(a.elements.nodes.d3);
			a.layout.positionRootNodes();
			a.force.start();
			while (a.force.alpha() > 0.005) {
				a.force.tick();
			}
			a.force.on('tick', a.layout.tick).start();
			return a.elements.nodes.svg.attr('transform', (id, i) => {
				return `translate(${id.x}, ${id.y})`;
			});
		};
	};

	Alchemy.prototype.defaults = {
		'plugins': null,
		'renderer': 'svg',
		'graphWidth'() {
			return d3.select(this.divSelector).node().parentElement.clientWidth;
		},
		'graphHeight'() {
			if (d3.select(this.divSelector).node().parentElement.nodeName === 'BODY') {
				return window.innerHeight;
			}
			return d3.select(this.divSelector).node().parentElement.clientHeight;

		},
		'alpha': 0.5,
		'collisionDetection': true,
		'nodeOverlap': 25,
		'fixNodes': false,
		'fixRootNodes': false,
		'forceLocked': true,
		'linkDistancefn': 'default',
		'nodePositions': null,
		'showEditor': false,
		'captionToggle': false,
		'toggleRootNodes': false,
		'removeElement': false,
		'cluster': false,
		'clusterKey': 'cluster',
		'clusterColours': d3.shuffle([ '#DD79FF', '#FFFC00', '#00FF30', '#5168FF', '#00C0FF', '#FF004B', '#00CDCD', '#f83f00', '#f800df', '#ff8d8f', '#ffcd00', '#184fff', '#ff7e00', ]),
		'clusterControl': false,
		'nodeStats': false,
		'edgeStats': false,
		'edgeFilters': false,
		'nodeFilters': false,
		'edgesToggle': false,
		'nodesToggle': false,
		'zoomControls': false,
		'nodeCaption': 'caption',
		'nodeCaptionsOnByDefault': false,
		'nodeStyle': {
			'all': {
				'radius': 10,
				'color': '#68B9FE',
				'borderColor': '#127DC1',
				'borderWidth'(d, radius) {
					return radius / 3;
				},
				'captionColor': '#FFFFFF',
				'captionBackground': null,
				'captionSize': 12,
				'highlighted': {
					'color': '#EEEEFF',
				},
				'hidden': {
					'color': 'none',
					'borderColor': 'none',
				},
			},
		},
		'nodeColour': null,
		'nodeMouseOver': 'caption',
		'nodeRadius': 10,
		'nodeTypes': null,
		'rootNodes': 'root',
		'rootNodeRadius': 15,
		'nodeClick': null,
		'edgeCaption': 'caption',
		'edgeCaptionsOnByDefault': false,
		'edgeStyle': {
			'all': {
				'width': 4,
				'color': '#CCC',
				'opacity': 0.2,
				'directed': true,
				'curved': true,
				'hidden': {
					'opacity': 0,
				},
			},
		},
		'edgeTypes': null,
		'curvedEdges': false,
		'edgeWidth'() {
			return 4;
		},
		'edgeOverlayWidth': 20,
		'directedEdges': false,
		'edgeArrowSize': 5,
		'edgeClick': null,
		'search': false,
		'searchMethod': 'contains',
		'backgroundColour': '#FFFFFF',
		'theme': null,
		'afterLoad': 'afterLoad',
		'divSelector': '#alchemy',
		'dataSource': null,
		'initialScale': 1,
		'initialTranslate': [ 0, 0, ],
		'scaleExtent': [ 0.5, 2.4, ],
		'exportSVG': false,
		'dataWarning': 'default',
		'warningMessage': 'There be no data!  What\'s going on?',
	};

	DrawEdge = function(instance) {
		return {
			'a': instance,
			'createLink'(edge) {
				let conf;
				conf = this.a.conf;
				edge.append('path').attr('class', 'edge-line').attr('id', (d) => {
					return `path-${d.id}`;
				});
				edge.filter((d) => {
					return d.caption != null;
				}).append('text');
				return edge.append('path').attr('class', 'edge-handler').style('stroke-width', `${conf.edgeOverlayWidth}`).style('opacity', '0');
			},
			'styleLink'(edge) {
				let a, conf, utils;
				a = this.a;
				conf = this.a.conf;
				utils = this.a.drawing.EdgeUtils;
				return edge.each(function(d) {
					let curve, curviness, edgeWalk, endx, endy, g, midpoint, startx, starty;
					edgeWalk = utils.edgeWalk(d);
					curviness = conf.curvedEdges ? 30 : 0;
					curve = curviness / 10;
					startx = d.source.radius + (d['stroke-width'] / 2);
					starty = curviness / 10;
					midpoint = edgeWalk.edgeLength / 2;
					endx = edgeWalk.edgeLength - (d.target.radius - (d.target['stroke-width'] / 2));
					endy = curviness / 10;
					g = d3.select(this);
					g.style(utils.edgeStyle(d));
					g.attr('transform', `translate(${d.source.x}, ${d.source.y}) rotate(${edgeWalk.edgeAngle})`);
					g.select('.edge-line').attr('d', (function() {
						let arrow, line, w;
						line = `M${startx},${starty}q${midpoint},${curviness} ${endx},${endy}`;
						if (conf.directedEdges) {
							w = d['stroke-width'] * 2;
							arrow = `l${-w},${w + curve} l${w},${-w - curve} l${-w},${-w + curve}`;
							return line + arrow;
						}
						return line;
					})());
					return g.select('.edge-handler').attr('d', (d) => {
						return g.select('.edge-line').attr('d');
					});
				});
			},
			'classEdge'(edge) {
				return edge.classed('active', true);
			},
			'styleText'(edge) {
				let conf, curved, utils;
				conf = this.a.conf;
				curved = conf.curvedEdges;
				utils = this.a.drawing.EdgeUtils;
				return edge.select('text').each(function(d) {
					let dx, edgeWalk;
					edgeWalk = utils.edgeWalk(d);
					dx = edgeWalk.edgeLength / 2;
					return d3.select(this).attr('dx', `${dx}`).text(d.caption).attr('xlink:xlink:href', `#path-${d.source.id}-${d.target.id}`).style('display', (d) => {
						if (conf.edgeCaptionsOnByDefault) {
							return 'block';
						}
					});
				});
			},
			'setInteractions'(edge) {
				let interactions;
				interactions = this.a.interactions;
				return edge.select('.edge-handler').on('click', interactions.edgeClick).on('mouseover', (d) => {
					return interactions.edgeMouseOver(d);
				}).on('mouseout', (d) => {
					return interactions.edgeMouseOut(d);
				});
			},
		};
	};

	DrawEdges = function(instance) {
		return {
			'a': instance,
			'createEdge'(d3Edges) {
				let drawEdge, edge;
				drawEdge = this.a.drawing.DrawEdge;
				edge = this.a.vis.selectAll('g.edge').data(d3Edges);
				edge.enter().append('g').attr('id', (d) => {
					return `edge-${d.id}-${d.pos}`;
				}).attr('class', (d) => {
					return `edge ${d.edgeType}`;
				}).attr('source-target', (d) => {
					return `${String(d.source.id)}-${d.target.id}`;
				});
				drawEdge.createLink(edge);
				drawEdge.classEdge(edge);
				drawEdge.styleLink(edge);
				drawEdge.styleText(edge);
				drawEdge.setInteractions(edge);
				edge.exit().remove();
				if (this.a.conf.directedEdges && this.a.conf.curvedEdges) {
					return edge.select('.edge-line').attr('marker-end', 'url(#arrow)');
				}
			},
			'updateEdge'(d3Edge) {
				let drawEdge, edge;
				drawEdge = this.a.drawing.DrawEdge;
				edge = this.a.vis.select(`#edge-${d3Edge.id}-${d3Edge.pos}`);
				drawEdge.classEdge(edge);
				drawEdge.styleLink(edge);
				drawEdge.styleText(edge);
				return drawEdge.setInteractions(edge);
			},
		};
	};

	DrawNode = function(instance) {
		return {
			'a': instance,
			'styleText'(node) {
				let conf, nodes, utils;
				conf = this.a.conf;
				utils = this.a.drawing.NodeUtils;
				nodes = this.a._nodes;
				return node.selectAll('text').attr('dy', (d) => {
					if (nodes[d.id].getProperties().root) {
						return conf.rootNodeRadius / 2;
					}
					return conf.nodeRadius * 2 - 5;

				}).attr('visibility', (d) => {
					if (nodes[d.id]._state === 'hidden') {
						return 'hidden';
					}
					return 'visible';

				}).text((d) => {
					return utils.nodeText(d);
				}).style('display', (d) => {
					if (conf.nodeCaptionsOnByDefault) {
						return 'block';
					}
				});
			},
			'createNode'(node) {
				node = _.difference(node, node.select('circle').data());
				node.__proto__ = d3.select().__proto__;
				node.append('circle').attr('id', (d) => {
					return `circle-${d.id}`;
				});
				return node.append('svg:text').attr('id', (d) => {
					return `text-${d.id}`;
				});
			},
			'styleNode'(node) {
				let utils;
				utils = this.a.drawing.NodeUtils;
				return node.selectAll('circle').attr('r', (d) => {
					if (typeof d.radius === 'function') {
						return d.radius();
					}
					return d.radius;

				}).each(function(d) {
					return d3.select(this).style(utils.nodeStyle(d));
				});
			},
			'setInteractions'(node) {
				let conf, coreInteractions, drag, editorEnabled, editorInteractions, nonRootNodes, rootNodes;
				conf = this.a.conf;
				coreInteractions = this.a.interactions;
				editorEnabled = this.a.get.state('interactions') === 'editor';
				drag = d3.behavior.drag().origin(Object).on('dragstart', null).on('drag', null).on('dragend', null);
				if (editorEnabled) {
					editorInteractions = new this.a.editor.Interactions();
					return node.on('mouseup', (d) => {
						return editorInteractions.nodeMouseUp(d);
					}).on('mouseover', (d) => {
						return editorInteractions.nodeMouseOver(d);
					}).on('mouseout', (d) => {
						return editorInteractions.nodeMouseOut(d);
					}).on('dblclick', (d) => {
						return coreInteractions.nodeDoubleClick(d);
					}).on('click', (d) => {
						return editorInteractions.nodeClick(d);
					});
				}
				node.on('mouseup', null).on('mouseover', (d) => {
					return coreInteractions.nodeMouseOver(d);
				}).on('mouseout', (d) => {
					return coreInteractions.nodeMouseOut(d);
				}).on('dblclick', (d) => {
					return coreInteractions.nodeDoubleClick(d);
				}).on('click', (d) => {
					return coreInteractions.nodeClick(d);
				});
				drag = d3.behavior.drag().origin(Object).on('dragstart', coreInteractions.nodeDragStarted).on('drag', coreInteractions.nodeDragged).on('dragend', coreInteractions.nodeDragended);
				if (!conf.fixNodes) {
					nonRootNodes = node.filter((d) => {
						return d.root !== true;
					});
					nonRootNodes.call(drag);
				}
				if (!conf.fixRootNodes) {
					rootNodes = node.filter((d) => {
						return d.root === true;
					});
					return rootNodes.call(drag);
				}

			},
		};
	};

	DrawNodes = function(instance) {
		return {
			'a': instance,
			'createNode'(d3Nodes) {
				let drawNode, node;
				drawNode = this.a.drawing.DrawNode;
				node = this.a.vis.selectAll('g.node').data(d3Nodes, (n) => {
					return n.id;
				});
				node.enter().append('g').attr('class', (d) => {
					let nodeType;
					nodeType = d.self._nodeType;
					return `node ${nodeType} active`;
				}).attr('id', (d) => {
					return `node-${d.id}`;
				}).classed('root', (d) => {
					return d.root;
				});
				drawNode.createNode(node);
				drawNode.styleNode(node);
				drawNode.styleText(node);
				drawNode.setInteractions(node);
				return node.exit().remove();
			},
			'updateNode'(alchemyNode) {
				let drawNode, node;
				drawNode = this.a.drawing.DrawNode;
				node = this.a.vis.select(`#node-${alchemyNode.id}`);
				drawNode.styleNode(node);
				drawNode.styleText(node);
				return drawNode.setInteractions(node);
			},
		};
	};

	Alchemy.prototype.EdgeUtils = function(instance) {
		return {
			'a': instance,
			'edgeStyle'(d) {
				let clustering, conf, edge, nodes, styles;
				conf = this.a.conf;
				edge = this.a._edges[d.id][d.pos];
				styles = this.a.svgStyles.edge.update(edge);
				nodes = this.a._nodes;
				if (this.a.conf.cluster) {
					clustering = this.a.layout._clustering;
					styles.stroke = (function(d) {
						let clusterKey, gid, id, index, source, target;
						clusterKey = conf.clusterKey;
						source = nodes[d.source.id]._properties;
						target = nodes[d.target.id]._properties;
						if (source.root || target.root) {
							index = source.root ? target[clusterKey] : source[clusterKey];
							return `${clustering.getClusterColour(index)}`;
						} else if (source[clusterKey] === target[clusterKey]) {
							index = source[clusterKey];
							return `${clustering.getClusterColour(index)}`;
						} else if (source[clusterKey] !== target[clusterKey]) {
							id = `${String(source[clusterKey])}-${target[clusterKey]}`;
							gid = `cluster-gradient-${id}`;
							return `url(#${gid})`;
						}
					})(d);
				}
				return styles;
			},
			'triangle'(edge) {
				let height, hyp, width;
				width = edge.target.x - edge.source.x;
				height = edge.target.y - edge.source.y;
				hyp = Math.sqrt(height * height + width * width);
				return [ width, height, hyp, ];
			},
			'edgeWalk'(edge) {
				let _ref, curveOffset, edgeLength, edgeWidth, height, hyp, startPathX, width;
				_ref = this.triangle(edge), width = _ref[0], height = _ref[1], hyp = _ref[2];
				edgeWidth = edge['stroke-width'];
				curveOffset = 2;
				startPathX = edge.source.radius + edge.source['stroke-width'] - (edgeWidth / 2) + curveOffset;
				edgeLength = hyp - startPathX - curveOffset * 1.5;
				return {
					'edgeAngle': Math.atan2(height, width) / Math.PI * 180,
					edgeLength,
				};
			},
			'middleLine'(edge) {
				return this.curvedDirectedEdgeWalk(edge, 'middle');
			},
			'startLine'(edge) {
				return this.curvedDirectedEdgeWalk(edge, 'linkStart');
			},
			'endLine'(edge) {
				return this.curvedDirectedEdgeWalk(edge, 'linkEnd');
			},
			'edgeLength'(edge) {
				let height, hyp, width;
				width = edge.target.x - edge.source.x;
				height = edge.target.y - edge.source.y;
				return hyp = Math.sqrt(height * height + width * width);
			},
			'edgeAngle'(edge) {
				let height, width;
				width = edge.target.x - edge.source.x;
				height = edge.target.y - edge.source.y;
				return Math.atan2(height, width) / Math.PI * 180;
			},
			'captionAngle'(angle) {
				if (angle < -90 || angle > 90) {
					return 180;
				}
				return 0;

			},
			'middlePath'(edge) {
				let midPoint, pathNode;
				pathNode = this.a.vis.select(`#path-${edge.id}`).node();
				midPoint = pathNode.getPointAtLength(pathNode.getTotalLength() / 2);
				return {
					'x': midPoint.x,
					'y': midPoint.y,
				};
			},
			'middlePathCurve'(edge) {
				let midPoint, pathNode;
				pathNode = d3.select(`#path-${edge.id}`).node();
				midPoint = pathNode.getPointAtLength(pathNode.getTotalLength() / 2);
				return {
					'x': midPoint.x,
					'y': midPoint.y,
				};
			},
		};
	};

	Alchemy.prototype.NodeUtils = function(instance) {
		let a;
		a = instance;
		return {
			'nodeStyle'(d) {
				let conf, node;
				conf = a.conf;
				node = d.self;
				if (conf.cluster && (node._state !== 'hidden')) {
					d.fill = (function(d) {
						let clusterMap, clustering, colour, colourIndex, colours, key, nodeProp;
						clustering = a.layout._clustering;
						nodeProp = node.getProperties();
						clusterMap = clustering.clusterMap;
						key = conf.clusterKey;
						colours = conf.clusterColours;
						colourIndex = clusterMap[nodeProp[key]] % colours.length;
						colour = colours[colourIndex];
						return `${colour}`;
					})(d);
					d.stroke = d.fill;
				}
				return d;
			},
			'nodeText'(d) {
				let caption, conf, nodeProps;
				conf = a.conf;
				nodeProps = a._nodes[d.id]._properties;
				if (conf.nodeCaption && typeof conf.nodeCaption === 'string') {
					if (nodeProps[conf.nodeCaption] != null) {
						return nodeProps[conf.nodeCaption];
					}
					return '';

				} else if (conf.nodeCaption && typeof conf.nodeCaption === 'function') {
					caption = conf.nodeCaption(nodeProps);
					if (caption === void 0 || String(caption) === 'undefined') {
						a.log.caption = 'At least one caption returned undefined';
						conf.caption = false;
					}
					return caption;
				}
			},
		};
	};

	Alchemy.prototype.svgStyles = function(instance) {
		return {
			'a': instance,
			'node': {
				'a': this.a,
				'populate'(node) {
					let conf, d, defaultStyle, fill, nodeType, nodeTypeKey, radius, stroke, strokeWidth, style, svgStyles, toFunc, typedStyle;
					conf = this.a.conf;
					defaultStyle = _.omit(conf.nodeStyle.all, 'selected', 'highlighted', 'hidden');
					d = node;
					toFunc = function(inp) {
						if (typeof inp === 'function') {
							return inp;
						}
						return function() {
							return inp;
						};
					};
					nodeTypeKey = _.keys(conf.nodeTypes)[0];
					nodeType = node.getProperties()[nodeTypeKey];
					if (conf.nodeStyle[nodeType] === void 0) {
						nodeType = 'all';
					}
					typedStyle = _.assign(_.cloneDeep(defaultStyle), conf.nodeStyle[nodeType]);
					style = _.assign(typedStyle, conf.nodeStyle[nodeType][node._state]);
					radius = toFunc(style.radius);
					fill = toFunc(style.color);
					stroke = toFunc(style.borderColor);
					strokeWidth = toFunc(style.borderWidth);
					svgStyles = {};
					svgStyles.radius = radius(d);
					svgStyles.fill = fill(d);
					svgStyles.stroke = stroke(d);
					svgStyles['stroke-width'] = strokeWidth(d, radius(d));
					return svgStyles;
				},
			},
			'edge': {
				'a': this.a,
				'populate'(edge) {
					let color, conf, defaultStyle, edgeType, opacity, style, svgStyles, toFunc, typedStyle, width;
					conf = this.a.conf;
					defaultStyle = _.omit(conf.edgeStyle.all, 'selected', 'highlighted', 'hidden');
					toFunc = function(inp) {
						if (typeof inp === 'function') {
							return inp;
						}
						return function() {
							return inp;
						};
					};
					edgeType = edge._edgeType;
					if (conf.edgeStyle[edgeType] === void 0) {
						edgeType = 'all';
					}
					typedStyle = _.assign(_.cloneDeep(defaultStyle), conf.edgeStyle[edgeType]);
					style = _.assign(typedStyle, conf.edgeStyle[edgeType][edge._state]);
					width = toFunc(style.width);
					color = toFunc(style.color);
					opacity = toFunc(style.opacity);
					svgStyles = {
						'stroke': color(edge),
						'stroke-width': width(edge),
						'opacity': opacity(edge),
						'fill': 'none',
					};
					return svgStyles;
				},
				'update'(edge) {
					let color, conf, opacity, style, svgStyles, toFunc, width;
					conf = this.a.conf;
					style = edge._style;
					toFunc = function(inp) {
						if (typeof inp === 'function') {
							return inp;
						}
						return function() {
							return inp;
						};
					};
					width = toFunc(style.width);
					color = toFunc(style.color);
					opacity = toFunc(style.opacity);
					svgStyles = {
						'stroke': color(edge),
						'stroke-width': width(edge),
						'opacity': opacity(edge),
						'fill': 'none',
					};
					return svgStyles;
				},
			},
		};
	};

	Editor = (function() {
		function Editor() {
			this.nodeEditor = __bind(this.nodeEditor, this);
			this.startEditor = __bind(this.startEditor, this);
			this.utils = new alchemy.editor.Utils();
		}

		Editor.prototype.editorContainerHTML = '<div id="editor-header" data-toggle="collapse" data-target="#editor #element-options">\n    <h3>Editor</h3><span class="fa fa-2x fa-caret-right"></span>\n</div>\n<div id="element-options" class="collapse">\n    <ul class="list-group"> \n        <li class="list-group-item" id="remove">Remove Selected</li> \n        <li class="list-group-item" id="editor-interactions">Editor mode enabled, click to disable editor interactions</li>\n    </ul>\n</div>';

		Editor.prototype.elementEditorHTML = function(type) {
			return `<h4>${type} Editor</h4>\n<form id="add-property-form">\n    <div id="add-property">\n        <input class="form-control" id="add-prop-key" placeholder="New Property Name">\n        <input class="form-control" id="add-prop-value" placeholder="New Property Value">\n    </div>\n    <input id="add-prop-submit" type="submit" value="Add Property" placeholder="add a property to this node">\n</form>\n<form id="properties-list">\n    <input id="update-properties" type="submit" value="Update Properties">\n</form>`;
		};

		Editor.prototype.startEditor = function() {
			let divSelector, editor, editor_interactions, html, utils;
			divSelector = alchemy.conf.divSelector;
			html = this.editorContainerHTML;
			editor = alchemy.dash.select('#control-dash').append('div').attr('id', 'editor').html(html);
			editor.select('#editor-header').on('click', () => {
				if (alchemy.dash.select('#element-options').classed('in')) {
					return alchemy.dash.select('#editor-header>span').attr('class', 'fa fa-2x fa-caret-right');
				}
				return alchemy.dash.select('#editor-header>span').attr('class', 'fa fa-2x fa-caret-down');

			});
			editor_interactions = editor.select('#element-options ul #editor-interactions').on('click', function() {
				return d3.select(this).attr('class', () => {
					if (alchemy.get.state() === 'editor') {
						alchemy.set.state('interactions', 'default');
						return 'inactive list-group-item';
					}
					alchemy.set.state('interactions', 'editor');
					return 'active list-group-item';

				}).html(() => {
					if (alchemy.get.state() === 'editor') {
						return 'Disable Editor Interactions';
					}
					return 'Enable Editor Interactions';

				});
			});
			editor.select('#element-options ul #remove').on('click', () => {
				return alchemy.editor.remove();
			});
			utils = this.utils;
			return editor_interactions.on('click', () => {
				if (!alchemy.dash.select('#editor-interactions').classed('active')) {
					utils.enableEditor();
					return alchemy.dash.select('#editor-interactions').classed({
						'active': true,
						'inactive': false,
					}).html('Editor mode enabled, click to disable editor interactions');
				}
				utils.disableEditor();
				return alchemy.dash.select('#editor-interactions').classed({
					'active': false,
					'inactive': true,
				}).html('Editor mode disabled, click to enable editor interactions');

			});
		};

		Editor.prototype.nodeEditor = function(n) {
			let add_property, divSelector, editor, elementEditor, html, nodeProperties, node_property, options, property, property_list, updateProperty, val;
			divSelector = alchemy.conf.divSelector;
			editor = alchemy.dash.select('#control-dash #editor');
			options = editor.select('#element-options');
			html = this.elementEditorHTML('Node');
			elementEditor = options.append('div').attr('id', 'node-editor').html(html);
			elementEditor.attr('class', () => {
				let active;
				active = alchemy.dash.select('#editor-interactions').classed('active');
				if (active) {
					return 'enabled';
				}
				return 'hidden';
			});
			add_property = editor.select('#node-editor form #add-property');
			add_property.select('#node-add-prop-key').attr('placeholder', 'New Property Name').attr('value', null);
			add_property.select('#node-add-prop-value').attr('placeholder', 'New Property Value').attr('value', null);
			alchemy.dash.select('#add-property-form').on('submit', function() {
				let key, value;
				event.preventDefault();
				key = alchemy.dash.select('#add-prop-key').property('value');
				key = key.replace(/\s/g, '_');
				value = alchemy.dash.select('#add-prop-value').property('value');
				updateProperty(key, value, true);
				alchemy.dash.selectAll('#add-property .edited-property').classed({
					'edited-property': false,
				});
				return this.reset();
			});
			nodeProperties = alchemy._nodes[n.id].getProperties();
			alchemy.vis.select(`#node-${n.id}`).classed({
				'editing': true,
			});
			property_list = editor.select('#node-editor #properties-list');
			for (property in nodeProperties) {
				val = nodeProperties[property];
				node_property = property_list.append('div').attr('id', `node-${property}`).attr('class', 'property form-inline form-group');
				node_property.append('label').attr('for', `node-${property}-input`).attr('class', 'form-control property-name').text(`${property}`);
				node_property.append('input').attr('id', `node-${property}-input`).attr('class', 'form-control property-value').attr('value', `${val}`);
			}
			alchemy.dash.select('#properties-list').on('submit', function() {
				let _i, _len, _ref, key, properties, selection, value;
				event.preventDefault();
				properties = alchemy.dash.selectAll('.edited-property');
				_ref = properties[0];
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					property = _ref[_i];
					selection = alchemy.dash.select(property);
					key = selection.select('label').text();
					value = selection.select('input').attr('value');
					updateProperty(key, value, false);
				}
				alchemy.dash.selectAll('#node-properties-list .edited-property').classed({
					'edited-property': false,
				});
				return this.reset();
			});
			d3.selectAll('#add-prop-key, #add-prop-value, .property').on('keydown', function() {
				if (d3.event.keyCode === 13) {
					event.preventDefault();
				}
				return d3.select(this).classed({
					'edited-property': true,
				});
			});
			return updateProperty = function(key, value, newProperty) {
				let drawNodes, nodeID;
				nodeID = n.id;
				if ((key !== '') && (value !== '')) {
					alchemy._nodes[nodeID].setProperty(`${key}`, `${value}`);
					drawNodes = alchemy._drawNodes;
					drawNodes.updateNode(alchemy.viz.select(`#node-${nodeID}`));
					if (newProperty === true) {
						alchemy.dash.select('#node-add-prop-key').attr('value', `property added/updated to key: ${key}`);
						return alchemy.dash.select('#node-add-prop-value').attr('value', `property at ${key} updated to: ${value}`);
					}
					return alchemy.dash.select(`#node-${key}-input`).attr('value', `property at ${key} updated to: ${value}`);

				}
				if (newProperty === true) {
					alchemy.dash.select('#node-add-prop-key').attr('value', 'null or invalid input');
					return alchemy.dash.select('#node-add-prop-value').attr('value', 'null or invlid input');
				}
				return alchemy.dash.select(`#node-${key}-input`).attr('value', 'null or invalid input');


			};
		};

		Editor.prototype.editorClear = function() {
			alchemy.dash.selectAll('.node').classed({
				'editing': false,
			});
			alchemy.dash.selectAll('.edge').classed({
				'editing': false,
			});
			alchemy.dash.select('#node-editor').remove();
			alchemy.dash.select('#edge-editor').remove();
			return alchemy.dash.select('#node-add-prop-submit').attr('placeholder', () => {
				if (alchemy.vis.selectAll('.selected').empty()) {
					return 'select a node or edge to edit properties';
				}
				return 'add a property to this element';
			});
		};

		Editor.prototype.edgeEditor = function(e) {
			let add_property, divSelector, edgeProperties, edge_property, editor, elementEditor, html, options, property, property_list, updateProperty, val;
			divSelector = alchemy.conf.divSelector;
			editor = alchemy.dash('#control-dash #editor');
			options = editor.select('#element-options');
			html = this.elementEditorHTML('Edge');
			elementEditor = options.append('div').attr('id', 'edge-editor').html(html);
			elementEditor.attr('class', () => {
				if (alchemy.dash.select('#editor-interactions').classed('active')) {
					return 'enabled';
				}
				return 'hidden';
			});
			add_property = editor.select('#edge-editor form #add-property');
			add_property.select('#add-prop-key').attr('placeholder', 'New Property Name').attr('value', null);
			add_property.select('#add-prop-value').attr('placeholder', 'New Property Value').attr('value', null);
			edgeProperties = alchemy._edges[e.id].getProperties();
			alchemy.vis.select(`#edge-${e.id}`).classed({
				'editing': true,
			});
			property_list = editor.select('#edge-editor #properties-list');
			for (property in edgeProperties) {
				val = edgeProperties[property];
				edge_property = property_list.append('div').attr('id', `edge-${property}`).attr('class', 'property form-inline form-group');
				edge_property.append('label').attr('for', `edge-${property}-input`).attr('class', 'form-control property-name').text(`${property}`);
				edge_property.append('input').attr('id', `edge-${property}-input`).attr('class', 'form-control property-value').attr('value', `${val}`);
			}
			alchemy.dash.selectAll('#add-prop-key, #add-prop-value, .property').on('keydown', function() {
				if (d3.event.keyCode === 13) {
					event.preventDefault();
				}
				return d3.select(this).classed({
					'edited-property': true,
				});
			});
			alchemy.dash.select('#add-property-form').on('submit', function() {
				let key, value;
				event.preventDefault();
				key = alchemy.dash.select('#add-prop-key').property('value');
				key = key.replace(/\s/g, '_');
				value = alchemy.dash.select('#add-prop-value').property('value');
				updateProperty(key, value, true);
				alchemy.dash.selectAll('#add-property .edited-property').classed({
					'edited-property': false,
				});
				return this.reset();
			});
			d3.select('#properties-list').on('submit', function() {
				let _i, _len, _ref, key, properties, selection, value;
				event.preventDefault();
				properties = alchemy.dash.selectAll('.edited-property');
				_ref = properties[0];
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					property = _ref[_i];
					selection = alchemy.dash.select(property);
					key = selection.select('label').text();
					value = selection.select('input').property('value');
					updateProperty(key, value, false);
				}
				alchemy.dash.selectAll('#properties-list .edited-property').classed({
					'edited-property': false,
				});
				return this.reset();
			});
			return updateProperty = function(key, value, newProperty) {
				let drawEdges, edgeID, edgeSelection;
				edgeID = e.id;
				if ((key !== '') && (value !== '')) {
					alchemy._edges[edgeID].setProperty(`${key}`, `${value}`);
					edgeSelection = alchemy.vis.select(`#edge-${edgeID}`);
					drawEdges = new alchemy.drawing.DrawEdges();
					drawEdges.updateEdge(alchemy.vis.select(`#edge-${edgeID}`));
					if (newProperty === true) {
						alchemy.dash.select('#add-prop-key').attr('value', `property added/updated to key: ${key}`);
						return alchemy.dash.select('#add-prop-value').attr('value', `property at ${key} updated to: ${value}`);
					}
					return alchemy.dash.select(`#edge-${key}-input`).attr('value', `property at ${key} updated to: ${value}`);

				}
				if (newProperty === true) {
					alchemy.dash.select('#add-prop-key').attr('value', 'null or invalid input');
					return alchemy.dash.select('#add-prop-value').attr('value', 'null or invlid input');
				}
				return alchemy.dash.select(`#edge-${key}-input`).attr('value', 'null or invalid input');


			};
		};

		return Editor;

	})();

	EditorInteractions = (function() {
		function EditorInteractions() {
			this.reset = __bind(this.reset, this);
			this.deleteSelected = __bind(this.deleteSelected, this);
			this.addNodeDragended = __bind(this.addNodeDragended, this);
			this.addNodeDragging = __bind(this.addNodeDragging, this);
			this.addNodeStart = __bind(this.addNodeStart, this);
			this.edgeClick = __bind(this.edgeClick, this);
			this.nodeClick = __bind(this.nodeClick, this);
			this.nodeMouseUp = __bind(this.nodeMouseUp, this);
			this.editor = new alchemy.editor.Editor();
		}

		EditorInteractions.prototype.nodeMouseOver = function(n) {
			let radius;
			if (!d3.select(this).select('circle').empty()) {
				radius = d3.select(this).select('circle').attr('r');
				d3.select(this).select('circle').attr('r', radius * 3);
			}
			return this;
		};

		EditorInteractions.prototype.nodeMouseUp = function(n) {
			if (this.sourceNode !== n) {
				this.mouseUpNode = true;
				this.targetNode = n;
				this.click = false;
			} else {
				this.click = true;
			}
			return this;
		};

		EditorInteractions.prototype.nodeMouseOut = function(n) {
			let radius;
			if (!d3.select(this).select('circle').empty()) {
				radius = d3.select(this).select('circle').attr('r');
				d3.select(this).select('circle').attr('r', radius / 3);
			}
			return this;
		};

		EditorInteractions.prototype.nodeClick = function(c) {
			let selected;
			d3.event.stopPropagation();
			if (!alchemy.vis.select(`#node-${c.id}`).empty()) {
				selected = alchemy.vis.select(`#node-${c.id}`).classed('selected');
				alchemy.vis.select(`#node-${c.id}`).classed('selected', !selected);
			}
			this.editor.editorClear();
			return this.editor.nodeEditor(c);
		};

		EditorInteractions.prototype.edgeClick = function(e) {
			d3.event.stopPropagation();
			this.editor.editorClear();
			return this.editor.edgeEditor(e);
		};

		EditorInteractions.prototype.addNodeStart = function(d, i) {
			d3.event.sourceEvent.stopPropagation();
			this.sourceNode = d;
			alchemy.vis.select('#dragline').classed({
				'hidden': false,
			});
			return this;
		};

		EditorInteractions.prototype.addNodeDragging = function(d, i) {
			let x2coord, y2coord;
			x2coord = d3.event.x;
			y2coord = d3.event.y;
			alchemy.vis.select('#dragline').attr('x1', this.sourceNode.x).attr('y1', this.sourceNode.y).attr('x2', x2coord).attr('y2', y2coord)
				.attr('style', 'stroke: #FFF');
			return this;
		};

		EditorInteractions.prototype.addNodeDragended = function(d, i) {
			let dragline, targetX, targetY;
			if (!this.click) {
				if (!this.mouseUpNode) {
					dragline = alchemy.vis.select('#dragline');
					targetX = dragline.attr('x2');
					targetY = dragline.attr('y2');
					this.targetNode = {
						'id': `${_.uniqueId('addedNode_')}`,
						'x': parseFloat(targetX),
						'y': parseFloat(targetY),
						'caption': 'node added',
					};
				}
				this.newEdge = {
					'id': `${String(this.sourceNode.id)}-${this.targetNode.id}`,
					'source': this.sourceNode.id,
					'target': this.targetNode.id,
					'caption': 'edited',
				};
				alchemy.editor.update(this.targetNode, this.newEdge);
			}
			this.reset();
			return this;
		};

		EditorInteractions.prototype.deleteSelected = function(d) {
			switch (d3.event.keyCode) {
			case 8:
			case 46:
				if (!(d3.select(d3.event.target).node().tagName === ('INPUT' || 'TEXTAREA'))) {
					d3.event.preventDefault();
					return alchemy.editor.remove();
				}
			}
		};

		EditorInteractions.prototype.reset = function() {
			this.mouseUpNode = null;
			this.sourceNode = null;
			this.targetNode = null;
			this.newEdge = null;
			this.click = null;
			alchemy.vis.select('#dragline').classed({
				'hidden': true,
			}).attr('x1', 0).attr('y1', 0).attr('x2', 0)
				.attr('y2', 0);
			return this;
		};

		EditorInteractions;

		return EditorInteractions;

	})();

	EditorUtils = (function() {
		function EditorUtils() {
			this.enableEditor = __bind(this.enableEditor, this);
			this.drawNodes = alchemy._drawNodes;
			this.drawEdges = alchemy._drawEdges;
		}

		EditorUtils.prototype.enableEditor = function() {
			let dragLine, editor, selectedElements;
			alchemy.set.state('interactions', 'editor');
			dragLine = alchemy.vis.append('line').attr('id', 'dragline');
			this.drawNodes.updateNode(alchemy.node);
			this.drawEdges.updateEdge(alchemy.edge);
			selectedElements = alchemy.vis.selectAll('.selected');
			editor = new alchemy.editor.Editor();
			if ((!selectedElements.empty()) && (selectedElements.length === 1)) {
				if (selectedElements.classed('node')) {
					editor.nodeEditor(selectedElements.datum());
					return alchemy.dash.select('#node-editor').attr('class', 'enabled').style('opacity', 1);
				} else if (selectedElements.classed('edge')) {
					editor.edgeEditor(selectedElements.datum());
					return alchemy.dash.select('#edge-editor').attr('class', 'enabled').style('opacity', 1);
				}
			} else {
				return selectedElements.classed({
					'selected': false,
				});
			}
		};

		EditorUtils.prototype.disableEditor = function() {
			alchemy.setState('interactions', 'default');
			alchemy.vis.select('#dragline').remove();
			alchemy.dash.select('#node-editor').transition().duration(300).style('opacity', 0);
			alchemy.dash.select('#node-editor').transition().delay(300).attr('class', 'hidden');
			this.drawNodes.updateNode(alchemy.node);
			return alchemy.vis.selectAll('.node').classed({
				'selected': false,
			});
		};

		EditorUtils.prototype.remove = function() {
			let _i, _j, _len, _len1, _ref, _ref1, _results, edge, node, nodeID, node_data, selectedNodes;
			selectedNodes = alchemy.vis.selectAll('.selected.node');
			_ref = selectedNodes[0];
			_results = [];
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				node = _ref[_i];
				nodeID = alchemy.vis.select(node).data()[0].id;
				node_data = alchemy._nodes[nodeID];
				if (node_data != null) {
					_ref1 = node_data.adjacentEdges;
					for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
						edge = _ref1[_j];
						alchemy._edges = _.omit(alchemy._edges, `${String(edge.id)}-${edge._index}`);
						alchemy.edge = alchemy.edge.data(_.map(alchemy._edges, (e) => {
							return e._d3;
						}), (e) => {
							return e.id;
						});
						alchemy.vis.select(`#edge-${edge.id}-${edge._index}`).remove();
					}
					alchemy._nodes = _.omit(alchemy._nodes, `${nodeID}`);
					alchemy.node = alchemy.node.data(_.map(alchemy._nodes, (n) => {
						return n._d3;
					}), (n) => {
						return n.id;
					});
					alchemy.vis.select(node).remove();
					if (alchemy.get.state('interactions') === 'editor') {
						_results.push(alchemy.modifyElements.nodeEditorClear());
					} else {
						_results.push(void 0);
					}
				} else {
					_results.push(void 0);
				}
			}
			return _results;
		};

		EditorUtils.prototype.addNode = function(node) {
			let newNode;
			newNode = alchemy._nodes[node.id] = new alchemy.models.Node({
				'id': `${node.id}`,
			});
			newNode.setProperty('caption', node.caption);
			newNode.setD3Property('x', node.x);
			newNode.setD3Property('y', node.y);
			return alchemy.node = alchemy.node.data(_.map(alchemy._nodes, (n) => {
				return n._d3;
			}), (n) => {
				return n.id;
			});
		};

		EditorUtils.prototype.addEdge = function(edge) {
			let newEdge;
			newEdge = alchemy._edges[edge.id] = new alchemy.models.Edge(edge);
			return alchemy.edge = alchemy.edge.data(_.map(alchemy._edges, (e) => {
				return e._d3;
			}), (e) => {
				return e.id;
			});
		};

		EditorUtils.prototype.update = function(node, edge) {
			if (!this.mouseUpNode) {
				alchemy.editor.addNode(node);
				alchemy.editor.addEdge(edge);
				this.drawEdges.createEdge(alchemy.edge);
				this.drawNodes.createNode(alchemy.node);
			} else {
				alchemy.editor.addEdge(edge);
				this.drawEdges.createEdge(alchemy.edge);
			}
			return alchemy.layout.tick();
		};

		return EditorUtils;

	})();

	Alchemy.prototype.Edge = function(instance) {
		let Edge;
		return Edge = (function() {
			function Edge(edge, index) {
				let conf;
				if (index == null) {
					index = null;
				}
				this.allNodesActive = __bind(this.allNodesActive, this);
				this.setProperties = __bind(this.setProperties, this);
				this.getStyles = __bind(this.getStyles, this);
				this.setProperties = __bind(this.setProperties, this);
				this.getProperties = __bind(this.getProperties, this);
				this._setID = __bind(this._setID, this);
				this._setD3Properties = __bind(this._setD3Properties, this);
				this.a = instance;
				conf = this.a.conf;
				this.id = this._setID(edge);
				this._index = index;
				this._state = 'active';
				this._properties = edge;
				this._edgeType = this._setEdgeType();
				this._style = conf.edgeStyle[this._edgeType] != null ? _.merge(_.clone(conf.edgeStyle.all), conf.edgeStyle[this._edgeType]) : _.clone(conf.edgeStyle.all);
				this._d3 = _.merge({
					'id': this.id,
					'pos': this._index,
					'edgeType': this._edgeType,
					'source': this.a._nodes[this._properties.source]._d3,
					'target': this.a._nodes[this._properties.target]._d3,
					'self': this,
				}, this.a.svgStyles.edge.populate(this));
				this._setCaption(edge, conf);
				this.a._nodes[`${edge.source}`]._addEdge(this);
				this.a._nodes[`${edge.target}`]._addEdge(this);
			}

			Edge.prototype._setD3Properties = function(props) {
				return _.merge(this._d3, props);
			};

			Edge.prototype._setID = function(e) {
				if (e.id != null) {
					return e.id;
				}
				return `${String(e.source)}-${e.target}`;

			};

			Edge.prototype._setCaption = function(edge, conf) {
				let cap, edgeCaption;
				cap = conf.edgeCaption;
				edgeCaption = (function(edge) {
					switch (typeof cap) {
					case 'string' || 'number':
						return edge[cap];
					case 'function':
						return cap(edge);
					}
				})(edge);
				if (edgeCaption) {
					return this._d3.caption = edgeCaption;
				}
			};

			Edge.prototype._setEdgeType = function() {
				let conf, edgeType, lookup;
				conf = this.a.conf;
				if (conf.edgeTypes) {
					if (_.isPlainObject(conf.edgeTypes)) {
						lookup = Object.keys(this.a.conf.edgeTypes);
						edgeType = this._properties[lookup];
					} else if (_.isArray(conf.edgeTypes)) {
						edgeType = this._properties.caption;
					} else if (typeof conf.edgeTypes === 'string') {
						edgeType = this._properties[conf.edgeTypes];
					}
				}
				if (edgeType === void 0) {
					edgeType = 'all';
				}
				this._setD3Properties('edgeType', edgeType);
				return edgeType;
			};

			Edge.prototype.getProperties = function() {
				let key, keys, query;
				key = arguments[0], keys = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
				if (key == null) {
					key = null;
				}
				if ((key == null) && (keys.length === 0)) {
					return this._properties;
				} else if (keys.length !== 0) {
					query = _.union([ key, ], keys);
					return _.pick(this._properties, query);
				}
				return this._properties[key];

			};

			Edge.prototype.setProperties = function(property, value) {
				if (value == null) {
					value = null;
				}
				if (_.isPlainObject(property)) {
					_.assign(this._properties, property);
					if ('source' in property) {
						this._setD3Properties({
							'source': alchemy._nodes[property.source]._d3,
						});
					}
					if ('target' in property) {
						this._setD3Properties({
							'target': alchemy._nodes[property.target]._d3,
						});
					}
				} else {
					this._properties[property] = value;
					if ((property === 'source') || (property === 'target')) {
						this._setD3Properties({
							'property': alchemy._nodes[value]._d3,
						});
					}
				}
				return this;
			};

			Edge.prototype.getStyles = function() {
				let edge, key, keys;
				key = arguments[0], keys = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
				edge = this;
				if (key === void 0) {
					return edge._style;
				}
				return _.map(arguments, (arg) => {
					return edge._style[arg];
				});
			};

			Edge.prototype.setProperties = function(property, value) {
				if (value == null) {
					value = null;
				}
				if (_.isPlainObject(property)) {
					_.assign(this._properties, property);
					if ('source' in property) {
						this._setD3Properties({
							'source': this.a._nodes[property.source]._d3,
						});
					}
					if ('target' in property) {
						this._setD3Properties({
							'target': this.a._nodes[property.target]._d3,
						});
					}
				} else {
					this._properties[property] = value;
					if ((property === 'source') || (property === 'target')) {
						this._setD3Properties({
							'property': this.a._nodes[value]._d3,
						});
					}
				}
				return this;
			};

			Edge.prototype.setStyles = function(key, value) {
				if (value == null) {
					value = null;
				}
				if (key === void 0) {
					key = this.a.svgStyles.edge.populate(this);
				}
				if (_.isPlainObject(key)) {
					_.assign(this._style, key);
				} else if (typeof key === 'string') {
					this._style[key] = value;
				}
				this._setD3Properties(this.a.svgStyles.edge.update(this));
				this.a._drawEdges.updateEdge(this._d3);
				return this;
			};

			Edge.prototype.toggleHidden = function() {
				this._state = this._state === 'hidden' ? 'active' : 'hidden';
				return this.setStyles();
			};

			Edge.prototype.allNodesActive = function() {
				let sourceId, sourceNode, targetId, targetNode;
				sourceId = this._properties.source;
				targetId = this._properties.target;
				sourceNode = alchemy.get.nodes(sourceId)[0];
				targetNode = alchemy.get.nodes(targetId)[0];
				return sourceNode._state === 'active' && targetNode._state === 'active';
			};

			Edge.prototype.remove = function() {
				let edge, filteredLinkList;
				edge = this;
				delete this.a._edges[edge.id];
				if (this.a._nodes[edge._properties.source] != null) {
					_.remove(this.a._nodes[edge._properties.source]._adjacentEdges, (e) => {
						if (e.id === edge.id) {
							return e;
						}
					});
				}
				if (this.a._nodes[edge._properties.target] != null) {
					_.remove(this.a._nodes[edge._properties.target]._adjacentEdges, (e) => {
						if (e.id === edge.id) {
							return e;
						}
					});
				}
				this.a.vis.select(`#edge-${edge.id}-${edge._index}`).remove();
				filteredLinkList = _.filter(this.a.force.links(), (link) => {
					if (link.id !== edge.id) {
						return link;
					}
				});
				return this.a.force.links(filteredLinkList);
			};

			return Edge;

		})();
	};

	Alchemy.prototype.Node = function(instance) {
		let Node;
		return Node = (function() {
			function Node(node) {
				this.getStyles = __bind(this.getStyles, this);
				this.setProperty = __bind(this.setProperty, this);
				this.getProperties = __bind(this.getProperties, this);
				this._setD3Properties = __bind(this._setD3Properties, this);
				this._setNodeType = __bind(this._setNodeType, this);
				let conf;
				this.a = instance;
				conf = this.a.conf;
				this.id = node.id;
				this._properties = node;
				this._d3 = _.merge({
					'id': this.id,
					'root': this._properties[conf.rootNodes],
					'self': this,
				}, this.a.svgStyles.node.populate(this));
				this._nodeType = this._setNodeType();
				this._style = conf.nodeStyle[this._nodeType] ? conf.nodeStyle[this._nodeType] : conf.nodeStyle.all;
				this._state = 'active';
				this._adjacentEdges = [];
			}

			Node.prototype._setNodeType = function() {
				let conf, lookup, nodeType, types;
				conf = this.a.conf;
				if (conf.nodeTypes) {
					if (_.isPlainObject(conf.nodeTypes)) {
						lookup = Object.keys(this.a.conf.nodeTypes);
						types = _.values(conf.nodeTypes);
						nodeType = this._properties[lookup];
					} else if (typeof conf.nodeTypes === 'string') {
						nodeType = this._properties[conf.nodeTypes];
					}
				}
				if (nodeType === void 0) {
					nodeType = 'all';
				}
				this._setD3Properties('nodeType', nodeType);
				return nodeType;
			};

			Node.prototype._setD3Properties = function(props) {
				return _.merge(this._d3, props);
			};

			Node.prototype._addEdge = function(edge) {
				return this._adjacentEdges = _.union(this._adjacentEdges, [ edge, ]);
			};

			Node.prototype.getProperties = function() {
				let key, keys, query;
				key = arguments[0], keys = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
				if (key == null) {
					key = null;
				}
				if ((key == null) && (keys.length === 0)) {
					return this._properties;
				} else if (keys.length !== 0) {
					query = _.union([ key, ], keys);
					return _.pick(this._properties, query);
				}
				return this._properties[key];

			};

			Node.prototype.setProperty = function(property, value) {
				if (value == null) {
					value = null;
				}
				if (_.isPlainObject(property)) {
					_.assign(this._properties, property);
				} else {
					this._properties[property] = value;
				}
				return this;
			};

			Node.prototype.removeProperty = function() {
				let _i, _len, prop, properties, property;
				property = arguments[0], properties = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
				for (_i = 0, _len = arguments.length; _i < _len; _i++) {
					prop = arguments[_i];
					delete this._properties[prop];
				}
				return this;
			};

			Node.prototype.getStyles = function() {
				let key, keys, node;
				key = arguments[0], keys = arguments.length >= 2 ? __slice.call(arguments, 1) : [];
				node = this;
				if (key === void 0) {
					return node._style;
				}
				return _.map(arguments, (arg) => {
					return node._style[arg];
				});
			};

			Node.prototype.setStyles = function(key, value) {
				if (value == null) {
					value = null;
				}
				if (key === void 0) {
					key = this.a.svgStyles.node.populate(this);
				} else if (_.isPlainObject(key)) {
					_.assign(this._style, key);
				} else {
					this._style[key] = value;
				}
				this._setD3Properties(this.a.svgStyles.node.populate(this));
				this.a._drawNodes.updateNode(this._d3);
				return this;
			};

			Node.prototype.toggleHidden = function() {
				let a;
				a = this.a;
				this._state = this._state === 'hidden' ? 'active' : 'hidden';
				this.setStyles();
				return _.each(this._adjacentEdges, (e) => {
					let _ref, source, sourceState, target, targetState;
					_ref = e.id.split('-'), source = _ref[0], target = _ref[1];
					sourceState = a._nodes[`${source}`]._state;
					targetState = a._nodes[`${target}`]._state;
					if (e._state === 'hidden' && (sourceState === 'active' && targetState === 'active')) {
						return e.toggleHidden();
					} else if (e._state === 'active' && (sourceState === 'hidden' || targetState === 'hidden')) {
						return e.toggleHidden();
					}
				});
			};

			Node.prototype.outDegree = function() {
				return this._adjacentEdges.length;
			};

			Node.prototype.remove = function() {
				while (!_.isEmpty(this._adjacentEdges)) {
					this._adjacentEdges[0].remove();
				}
				delete this.a._nodes[this.id];
				return this.a.vis.select(`#node-${this.id}`).remove();
			};

			return Node;

		})();
	};

	Alchemy.prototype.plugins = function(instance) {
		return {
			'init'() {
				return _.each(_.keys(instance.conf.plugins), (key) => {
					instance.plugins[key] = Alchemy.prototype.plugins[key](instance);
					if (instance.plugins[key].init != null) {
						return instance.plugins[key].init();
					}
				});
			},
		};
	};

	Alchemy.prototype.themes = {
		'default': {
			'backgroundColour': '#000000',
			'nodeStyle': {
				'all': {
					'radius'() {
						return 10;
					},
					'color'() {
						return '#68B9FE';
					},
					'borderColor'() {
						return '#127DC1';
					},
					'borderWidth'(d, radius) {
						return radius / 3;
					},
					'captionColor'() {
						return '#FFFFFF';
					},
					'captionBackground'() {
						return null;
					},
					'captionSize': 12,
					'selected': {
						'color'() {
							return '#FFFFFF';
						},
						'borderColor'() {
							return '#349FE3';
						},
					},
					'highlighted': {
						'color'() {
							return '#EEEEFF';
						},
					},
					'hidden': {
						'color'() {
							return 'none';
						},
						'borderColor'() {
							return 'none';
						},
					},
				},
			},
			'edgeStyle': {
				'all': {
					'width': 4,
					'color': '#CCC',
					'opacity': 0.2,
					'directed': true,
					'curved': true,
					'selected': {
						'opacity': 1,
					},
					'highlighted': {
						'opacity': 1,
					},
					'hidden': {
						'opacity': 0,
					},
				},
			},
		},
		'white': {
			'theme': 'white',
			'backgroundColour': '#FFFFFF',
			'nodeStyle': {
				'all': {
					'radius'() {
						return 10;
					},
					'color'() {
						return '#68B9FE';
					},
					'borderColor'() {
						return '#127DC1';
					},
					'borderWidth'(d, radius) {
						return radius / 3;
					},
					'captionColor'() {
						return '#FFFFFF';
					},
					'captionBackground'() {
						return null;
					},
					'captionSize': 12,
					'selected': {
						'color'() {
							return '#FFFFFF';
						},
						'borderColor'() {
							return '38DD38';
						},
					},
					'highlighted': {
						'color'() {
							return '#EEEEFF';
						},
					},
					'hidden': {
						'color'() {
							return 'none';
						},
						'borderColor'() {
							return 'none';
						},
					},
				},
			},
			'edgeStyle': {
				'all': {
					'width': 4,
					'color': '#333',
					'opacity': 0.4,
					'directed': false,
					'curved': false,
					'selected': {
						'color': '#38DD38',
						'opacity': 0.9,
					},
					'highlighted': {
						'color': '#383838',
						'opacity': 0.7,
					},
					'hidden': {
						'opacity': 0,
					},
				},
			},
		},
	};

	Alchemy.prototype.exports = function(instance) {
		let a;
		a = instance;
		return {
			'init'() {
				return a.exports.show();
			},
			'show'() {
				return a.dash.select('#all-exports').append('li').attr({
					'class': 'list-group-item active-label toggle',
				}).html('SVG').on('click', (e) => {
					let sanitizedUrl, str, svg, url, win;
					svg = d3.select(`${String(a.conf.divSelector)} svg`).node();
					str = (new XMLSerializer()).serializeToString(svg);
					url = `data:image/svg+xml;utf8,${str}`;
					sanitizedUrl = url.replace('xlink:', '');
					win = window.open(sanitizedUrl);
					return win.focus();
				});
			},
		};
	};

	warnings = (function() {
		function warnings(instance) {
			this.dataWarning = __bind(this.dataWarning, this);
			this.a = instance;
		}

		warnings.prototype.dataWarning = function() {
			if (this.a.conf.dataWarning && typeof this.a.conf.dataWarning === 'function') {
				return this.a.conf.dataWarning();
			} else if (this.a.conf.dataWarning === 'default') {
				return console.log('No dataSource was loaded');
			}
		};

		warnings.prototype.divWarning = function() {
			return 'create an element that matches the value for \'divSelector\' in your conf.\nFor instance, if you are using the default \'divSelector\' conf, simply provide\n<div id=\'#alchemy\'></div>.';
		};

		return warnings;

	})();

}).call(this);

// # sourceMappingURL=alchemy.js.map
