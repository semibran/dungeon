module.exports = Room
Room.Room = Room
Room.edges = edges

function Room(width, height) {
	return {
		width, height,
		x: null,
		y: null
	}
}

function edges(room) {
	var edges = new Array(room.width * 2 + room.height * 2)
	var index = 0

	var left = room.x
	var top = room.y
	var right = room.x + room.width
	var bottom = room.y + room.height

	for (var x = left; x < right; x++) {
		edges[index++] = { x, y: room.y - 1 }
		edges[index++] = { x, y: bottom }
	}

	for (var y = top; y < bottom; y++) {
		edges[index++] = { x: room.x - 1, y }
		edges[index++] = { x: right, y }
	}

	return edges
}
