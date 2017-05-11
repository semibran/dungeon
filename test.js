const { Dungeon } = require('../dungeon')
const { index, cells } = require('grid')
const { Seed } = require('random')
const { add } = require('vector2d')
const { floor, random } = Math
const sprites = {
	floor: '  ',
	wall: String.fromCharCode(0x2588).repeat(2),
	door: String.fromCharCode(0x2591).repeat(2)
}

var seed = Seed(random())
var dungeon = Dungeon(25, 25)(seed)
var world = {
	width: dungeon.width,
	height: dungeon.height,
	tiles: new Array(dungeon.width * dungeon.height).fill('wall')
}

for (var room of dungeon.rooms) {
	for (var cell of cells(room).map(cell => add(cell, room))) {
		world.tiles[index(world, cell)] = 'floor'
	}
}

for (var maze of dungeon.mazes) {
	for (var cell of maze) {
		world.tiles[index(world, cell)] = 'floor'
	}
}

for (var cell of dungeon.doors) {
	world.tiles[index(world, cell)] = 'door'
}

console.log(render(world))

function render(world) {
	var view = ''
	for (var cell of cells(world)) {
		var tile = world.tiles[index(world, cell)]
		var sprite = sprites[tile]
		if (!cell.x && cell.y) {
			view += '\n' + sprite
		} else {
			view += sprite
		}
	}
	return view
}
