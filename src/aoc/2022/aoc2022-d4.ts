import fs from 'fs'

// const rawInput = fs.readFileSync('assets/aoc/2022/aoc2022-d4-sample.txt', 'utf8')
const rawInput = fs.readFileSync('assets/aoc/2022/aoc2022-d4.txt', 'utf8')
const input = rawInput.split('\n')

type Range = {
  lo: number
  hi: number
}

const parseRange = (raw: string): Range => {
  const range: Range = { lo: 0, hi: 0 }
  ;[range.lo, range.hi] = raw.split('-').map(Number)
  return range
}

const aFullyInB = (a: Range, b: Range) => a.lo >= b.lo && a.hi <= b.hi

const part1 = () => {
  let total = 0
  input.forEach(pair => {
    const [r1, r2] = pair.split(',').map(parseRange)
    if (aFullyInB(r1, r2) || aFullyInB(r2, r1)) {
      total++
    }
  })
  return total
}

const aOverlapsB = (a: Range, b: Range) => a.hi >= b.lo && a.lo <= b.hi

const part2 = () => {
  let total = 0
  input.forEach(pair => {
    const [r1, r2] = pair.split(',').map(parseRange)
    if (aOverlapsB(r1, r2)) {
      total++
    }
  })
  return total
}

console.log('In how many assignment pairs does one range fully contain the other?', part1())
console.log('In how many assignment pairs do the ranges overlap?', part2())
//
