import fs from 'fs'

import * as lib from '../lib/index.js'

const [year, day] = ['2015', '6']

// const rawInput = fs.readFileSync(`assets/aoc/${year}/aoc${year}-d${day}-sample.txt`, 'utf8')
const rawInput = fs.readFileSync(`assets/aoc/${year}/aoc${year}-d${day}.txt`, 'utf8')
// const [raw1, raw2] = rawInput.split('\n\n')
const input = rawInput.split('\n')

const grid: number[][] = Array(1000)
const initGrid = () => {
  for (let i = 0; i < grid.length; i++) {
    grid[i] = Array(1000).fill(0)
  }
}

interface Point {
  c: number
  r: number
}

interface Rect {
  br: Point
  tl: Point
}

class LightRect {
  rect: Rect
  constructor(t: number, l: number, b: number, r: number) {
    this.rect = {
      br: { c: r, r: b },
      tl: { c: l, r: t },
    }
  }

  increase(amount: number) {
    for (let r = this.rect.tl.r; r <= this.rect.br.r; r++) {
      for (let c = this.rect.tl.c; c <= this.rect.br.c; c++) {
        grid[r][c] = Math.max(grid[r][c] + amount, 0)
      }
    }
  }

  toggle() {
    for (let r = this.rect.tl.r; r <= this.rect.br.r; r++) {
      for (let c = this.rect.tl.c; c <= this.rect.br.c; c++) {
        grid[r][c] = grid[r][c] ? 0 : 1
      }
    }
  }

  turnOff() {
    for (let r = this.rect.tl.r; r <= this.rect.br.r; r++) {
      for (let c = this.rect.tl.c; c <= this.rect.br.c; c++) {
        grid[r][c] = 0
      }
    }
  }

  turnOn() {
    for (let r = this.rect.tl.r; r <= this.rect.br.r; r++) {
      for (let c = this.rect.tl.c; c <= this.rect.br.c; c++) {
        grid[r][c] = 1
      }
    }
  }
}

const countOn = () => {
  let total = 0
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) {
        total++
      }
    }
  }

  return total
}

const gridTotal = () => {
  let total = 0
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const value = grid[r][c]
      if (value) {
        total += grid[r][c]
      }
    }
  }

  return total
}

const part1 = () => {
  initGrid()
  input.forEach(line => {
    const rect = new LightRect(...(lib.ints(line) as [number, number, number, number]))
    if (line.startsWith('turn on')) {
      rect.turnOn()
    } else if (line.startsWith('turn off')) {
      rect.turnOff()
    } else if (line.startsWith('toggle')) {
      rect.toggle()
    }
  })
  return countOn()
}

const part2 = () => {
  initGrid()
  input.forEach(line => {
    const rect = new LightRect(...(lib.ints(line) as [number, number, number, number]))
    if (line.startsWith('turn on')) {
      rect.increase(1)
    } else if (line.startsWith('turn off')) {
      rect.increase(-1)
    } else if (line.startsWith('toggle')) {
      rect.increase(2)
    }
  })
  return gridTotal()
}

console.log('part1:', part1())
console.log('part2:', part2())
