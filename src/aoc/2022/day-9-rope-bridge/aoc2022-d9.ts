import fs from 'fs'

// import * as lib from '../../lib/index.js'

const [year, day, path] = ['2022', '9', 'src/aoc/2022/day-9-rope-bridge/']

// eslint-disable-next-line prefer-const
let testSample = false
// testSample = true
const fullPath = `${path}aoc${year}-d${day}${testSample ? '-sample' : ''}.txt`
const rawInput = fs.readFileSync(fullPath, 'utf8')
// const [raw1, raw2] = rawInput.split('\n\n')
const input = rawInput.split('\n')

interface Point {
  x: number
  y: number
}

enum Heading {
  EAST = 'R',
  NORTH = 'U',
  SOUTH = 'D',
  WEST = 'L',
}

let visited: Set<string>

class Actor {
  #hereBefore = (location: Point) => {
    const locationKey = JSON.stringify(location)
    if (visited.has(locationKey)) {
      return true
    }

    visited.add(locationKey)
    return false
  }

  #moveByOne = (heading: Heading) => {
    switch (heading) {
      case Heading.NORTH:
        this.knots[0].y--
        break
      case Heading.SOUTH:
        this.knots[0].y++
        break
      case Heading.EAST:
        this.knots[0].x++
        break
      case Heading.WEST:
        this.knots[0].x--
        break
    }

    for (let i = 0; i < this.knots.length - 1; i++) {
      this.#propagate(this.knots[i], this.knots[i + 1])
    }

    this.#hereBefore(this.knots[this.knots.length - 1])
  }

  #propagate = (head: Point, tail: Point) => {
    const dx = head.x - tail.x
    const dy = head.y - tail.y
    if (Math.abs(dx) >= 2 || Math.abs(dy) >= 2) {
      tail.x += Math.sign(dx)
      tail.y += Math.sign(dy)
    }
  }

  knots: Point[] = []

  move = (heading: Heading, distance: number) => {
    while (distance--) {
      this.#moveByOne(heading)
    }
  }

  constructor(ropeLength = 2) {
    this.knots = Array<Point>(ropeLength)
    for (let i = 0; i < this.knots.length; i++) {
      this.knots[i] = { x: 0, y: 0 }
    }

    this.#hereBefore({ x: 0, y: 0 }) // register the origin as visited
  }
}

const part1 = () => {
  visited = new Set()
  const rope = new Actor()
  input.forEach(line => {
    const [dir, str] = line.split(' ')
    rope.move(dir as Heading, parseInt(str))
  })
  return visited.size
}

const part2 = () => {
  visited = new Set()
  const rope = new Actor(10)
  input.forEach(line => {
    const [dir, str] = line.split(' ')
    rope.move(dir as Heading, parseInt(str))
  })
  return visited.size
}

console.log('part1:', part1())
console.log('part2:', part2())
