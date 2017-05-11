# dungeon
> Seedable roguelike dungeon generator

## install
```sh
npm install dungeon
```

## usage
```js
const Dungeon = require('dungeon')
```

A `Dungeon` is a plain object with the fields `width`, `height`, `rooms`, `mazes`, and `doors`.

See [`test.js`](https://github.com/semibran/dungeon/blob/master/test.js) for a running example.

### `Dungeon`
Generate a `Dungeon` of the specified `width` and `height` with the given [`seed`](https://github.com/semibran/random#seed).
```js
var dungeon = Dungeon(25, 25)(Seed(Math.PI))
```
This function is curried, so you could assign it to a variable and generate multiple dungeons of that specific size later on.
```js
var generate = Dungeon(25, 25)
```

## license
MIT
