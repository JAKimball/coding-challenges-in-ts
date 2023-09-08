import fs from 'fs'

import * as lib from '../../lib/index.js'

const [year, day, path] = ['2022', '13', 'src/aoc/2022/day-13-distress-signal/']

// eslint-disable-next-line prefer-const
let testSample = false
testSample = true
const fullPath = `${path}aoc${year}-d${day}${testSample ? '-sample' : ''}.txt`
const rawInput = fs.readFileSync(fullPath, 'utf8')
// const [raw1, raw2] = rawInput.split('\n\n')
const input = rawInput.split('\n')
while (input[input.length - 1] === '') {
  input.pop()
}

const part1 = () => {
  // eslint-disable-next-line prefer-const
  let total = 0
  input.forEach(line => {
    const [n, f, t] = lib.ints(line)
  })
  return total
}

const part2 = () => {
  // eslint-disable-next-line prefer-const
  let total = 0
  input.forEach(line => {
    const [n, f, t] = lib.ints(line)
  })
  return total
}

console.log('part1:', part1())
console.log('part2:', part2())
