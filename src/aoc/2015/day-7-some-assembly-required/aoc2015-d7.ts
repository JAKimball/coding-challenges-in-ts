import fs from 'fs'
import * as lib from '../../lib/index.js'

const [year, day, path] = ['2015', '7', 'src/aoc/2015/day-7-some-assembly-required/']

const rawInput = fs.readFileSync(`${path}aoc${year}-d${day}-sample.txt`, 'utf8')
// const rawInput = fs.readFileSync(`${path}aoc${year}-d${day}.txt`, 'utf8')
// const [raw1, raw2] = rawInput.split('\n\n')
const input = rawInput.split('\n')

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
