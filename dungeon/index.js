module.exports = Dungeon
Dungeon.Dungeon = Dungeon

const { Room, edges } = require('./room')
const { cells } = require('grid')
const { adjacent } = require('cell')
const { remove } = require('array')
const { int, choose } = require('random')
const directions = require('directions')
const { add, subtract, multiply, equals, magnitude } = require('vector2d')
const { floor } = Math
const lengths = [3, 5, 7]

function Dungeon(width, height) {
	return function generate(seed) {
		var dungeon = {
			width, height,
			rooms: [],
			mazes: [],
			doors: []
		}

		var nodes = cells(dungeon).filter(cell => cell.x % 2 && cell.y % 2)

		do {
			var room = Room(choose(lengths)(seed), choose(lengths)(seed))
			var positions = nodes.filter(
				node => cells(room)
					.map(cell => add(cell, node))
					.filter(cell => cell.x % 2 && cell.y % 2)
					.every(cell => nodes.find(node => equals(cell, node)))
			)
			if (positions.length) {
				var position = choose(positions)(seed)
				room.x = position.x
				room.y = position.y
				dungeon.rooms.push(room)

				var bounds = {
					width: room.width + 2,
					height: room.height + 2,
					x: room.x - 1,
					y: room.y - 1
				}
				for (var cell of cells(bounds).map(cell => add(cell, bounds))) {
					var node = nodes.find(node => equals(node, cell))
					if (node) {
						remove(nodes, node)
					}
				}
			}
		} while (positions.length)

		while (nodes.length) {
			var node = choose(nodes)(seed)
			var maze = [node]
			var stack = [node]
			remove(nodes, node)
			while (node) {
				var neighbors = []
				var deltas = new Map()
				for (var direction in directions) {
					var delta = directions[direction]
					var target = add(node, multiply(delta, 2))
					var neighbor = nodes.find(node => equals(node, target))
					if (neighbor) {
						neighbors.push(neighbor)
						deltas.set(neighbor, delta)
					}
				}
				if (neighbors.length) {
					var neighbor = choose(neighbors)(seed)
					var midpoint = add(node, deltas.get(neighbor))
					maze.push(midpoint, neighbor)
					stack.push(neighbor)
					remove(nodes, neighbor)
					node = neighbor
				} else {
					node = stack.pop()
				}
			}
			dungeon.mazes.push(maze)
		}

		var connections = new Map()
		var nodes = [...dungeon.rooms, ...dungeon.mazes]
		var node = choose(dungeon.rooms)(seed)
		var stack = [node]
		connections.set(node, [])
		remove(nodes, node)

		while (node) {
			var neighbors = new Map()
			if (dungeon.rooms.includes(node)) {
				for (var edge of edges(node)) {
					for (var direction in directions) {
						var delta = directions[direction]
						var cell = add(edge, delta)
						var neighbor = nodes.find(neighbor => {
							if (dungeon.rooms.includes(neighbor)) {
								return cells(neighbor).map(cell => add(cell, neighbor)).find(other => equals(cell, other))
							} else if (dungeon.mazes.includes(neighbor)) {
								return neighbor.find(other => equals(cell, other))
							}
						})
						if (neighbor) {
							var connectors = neighbors.get(neighbor)
							if (connectors) {
								connectors.push(edge)
							} else {
								connectors = [edge]
								neighbors.set(neighbor, connectors)
							}
						}
					}
				}
			} else if (dungeon.mazes.includes(node)) {
				var maze = node
				for (var cell of maze) {
					for (var direction in directions) {
						var delta = directions[direction]
						var edge = add(cell, delta)
						var target = add(edge, delta)
						var neighbor = nodes.find(neighbor => {
							if (dungeon.rooms.includes(neighbor)) {
								return cells(neighbor).map(cell => add(cell, neighbor)).find(cell => equals(target, cell))
							} else if (dungeon.mazes.includes(neighbor)) {
								return neighbor.find(cell => equals(target, cell))
							}
						})
						if (neighbor) {
							var connectors = neighbors.get(neighbor)
							if (connectors) {
								connectors.push(edge)
							} else {
								connectors = [edge]
								neighbors.set(neighbor, connectors)
							}
						}
					}
				}
			}
			if (neighbors.size) {
				var neighbor = choose([...neighbors.keys()])(seed)
				var connectors = neighbors.get(neighbor)
				var connector = choose(connectors)(seed)
				dungeon.doors.push(connector)
				stack.push(neighbor)
				connections.get(node).push(neighbor)
				connections.set(neighbor, [])
				remove(nodes, neighbor)
				node = neighbor
				// console.log('travelling through', connector, 'to', neighbor)
			} else {
				remove(stack, node)
				if (!connections.get(node).length && dungeon.mazes.includes(node)) {
					dungeon.doors.pop()
				}
				node = stack[stack.length - 1]
				// console.log('backtracking to', node)
			}
		}

		for (var maze of dungeon.mazes) {
			var stack = ends(maze)
			while (stack.length) {
				var end = stack.pop()
				var door = dungeon.doors.find(door => adjacent(end, door))
				var neighbors = maze.filter(cell => adjacent(end, cell))
				var neighbor = neighbors[0]
				if (!door) {
					if (neighbors.length <= 1) {
						remove(maze, end)
						if (neighbors.length) {
							stack.push(neighbor)
						}
					}
				}
			}
		}

		return dungeon
	}
}

function ends(maze) {
	return maze.filter(cell => {
		var neighbors = maze.filter(other => adjacent(cell, other))
		return neighbors.length <= 1
	})
}
