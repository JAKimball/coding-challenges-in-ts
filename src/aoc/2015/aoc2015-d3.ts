import fs from 'fs'

// Synchronously read our data file
const input = fs.readFileSync('assets/aoc/2015/aoc2015-d3.txt', 'utf8')

type Point = {
  x: number
  y: number
}

enum Heading {
  EAST = '>',
  NORTH = '^',
  SOUTH = 'v',
  WEST = '<',
}

const location: Point = { x: 0, y: 0 }

const memory = new Set<string>()
const hereBefore = () => {
  const locationKey = JSON.stringify(location)
  if (memory.has(locationKey)) {
    return true
  }

  memory.add(locationKey)
  return false
}

const move = (heading: Heading, distance = 1) => {
  switch (heading) {
    case Heading.NORTH:
      location.x += distance
      break
    case Heading.SOUTH:
      location.x -= distance
      break
    case Heading.EAST:
      location.y += distance
      break
    case Heading.WEST:
      location.y -= distance
      break
  }

  hereBefore()
}

hereBefore()
input.split('').forEach(heading => {
  move(heading as Heading)
})

console.log('Houses', memory.size)

//
