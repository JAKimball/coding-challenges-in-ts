import fs from 'fs'

// Synchronously read our data file
const input = fs.readFileSync('assets/aoc/2016/aoc2016-d1.txt', 'utf8')

type Point = {
  x: number
  y: number
}

enum Heading {
  NORTH = 0,
  EAST = 1,
  SOUTH = 2,
  WEST = 3,
}

class Actor {
  location: Point = { x: 0, y: 0 }
  heading: Heading = Heading.NORTH
  memory: Set<string> = new Set()

  constructor() {
    this.hereBefore() // register the origin as visited
  }

  hereBefore = () => {
    const locationKey = JSON.stringify(this.location)
    if (this.memory.has(locationKey)) {
      return true
    }
    this.memory.add(locationKey)
    return false
  }

  turn = (direction: string) => {
    switch (direction) {
      case 'R':
        this.heading = (this.heading + 1) % 4
        break
      case 'L':
        this.heading = (this.heading + 3) % 4
        break
    }
  }

  move = (distance = 1) => {
    switch (this.heading) {
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
  }

  moveWhileChecking = (distance: number): boolean => {
    while (distance--) {
      this.move()
      if (this.hereBefore()) {
        return true
      }
    }
    return false
  }

  executeStep = (step: string): boolean => {
    const direction = step[0]
    const distance = parseInt(step.slice(1))
    this.turn(direction)
    return this.moveWhileChecking(distance)
  }

  executePlan = (plan: string) => {
    plan.split(', ').some(this.executeStep) // execute until any past location is re-visited
  }
}

const gridDistance = (pointA: Point, pointB: Point = { x: 0, y: 0 }) =>
  Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y)

// Test 1
let walker = new Actor()
walker.executePlan('R2, L3')
console.log(gridDistance(walker.location))

// Test 2
walker = new Actor()
walker.executePlan('R2, R2, R2')
console.log(gridDistance(walker.location))

// Test 3
walker = new Actor()
walker.executePlan('R5, L5, R5, R3')
console.log(gridDistance(walker.location))

// Test 4
walker = new Actor()
walker.executePlan('R8, R4, R4, R8')
console.log(gridDistance(walker.location))

walker = new Actor()
walker.executePlan(input)
console.log('Final distance in blocks:', gridDistance(walker.location))
