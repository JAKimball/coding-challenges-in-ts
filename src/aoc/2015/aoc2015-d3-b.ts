import fs from 'fs'

// Synchronously read our data file
const input = fs.readFileSync('assets/aoc/2015/aoc2015-d3.txt', 'utf8')

interface Point {
  x: number
  y: number
}

enum Heading {
  EAST = '>',
  NORTH = '^',
  SOUTH = 'v',
  WEST = '<',
}

const visited = new Set<string>()

class Actor {
  hereBefore = () => {
    const locationKey = JSON.stringify(this.location)
    if (visited.has(locationKey)) {
      return true
    }

    visited.add(locationKey)
    return false
  }

  location: Point = { x: 0, y: 0 }

  move = (heading: Heading, distance = 1) => {
    switch (heading) {
      case Heading.NORTH:
        this.location.x += distance
        break
      case Heading.SOUTH:
        this.location.x -= distance
        break
      case Heading.EAST:
        this.location.y += distance
        break
      case Heading.WEST:
        this.location.y -= distance
        break
    }

    this.hereBefore()
  }

  constructor() {
    this.hereBefore() // register the origin as visited
  }
}

const santa = new Actor()
const roboSanta = new Actor()

input.split('').forEach((heading, index) => {
  index % 2 ? santa.move(heading as Heading) : roboSanta.move(heading as Heading)
})

console.log('Houses', visited.size)

//
