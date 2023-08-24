import fs from 'fs'
import * as lib from '../../lib/index.js'

const [year, day, path] = ['2022', '10', 'src/aoc/2022/day-10-cathode-ray-tube/']

// eslint-disable-next-line prefer-const
let testSample = false
// testSample = true
const fullPath = `${path}aoc${year}-d${day}${testSample ? '-sample' : ''}.txt`
const rawInput = fs.readFileSync(fullPath, 'utf8')
// const [raw1, raw2] = rawInput.split('\n\n')
const input = rawInput.split('\n')
while (input[input.length - 1] === '') {
  input.pop()
}

const part1 = () => {
  const sampleAt = [20, 60, 100, 140, 180, 220, 9999]
  let total = 0
  let currentCycle = 1
  let x = 1
  let sampleIndex = 0
  let nextSample = sampleAt[sampleIndex++]
  for (const line of input) {
    let v = 0
    if (line.startsWith('addx ')) {
      currentCycle += 2
      ;[v] = lib.ints(line)
    } else currentCycle++
    if (currentCycle > nextSample) {
      const strength = nextSample * x
      total += strength
      nextSample = sampleAt[sampleIndex++]
      console.log(strength, total)
    }
    x += v
  }
  return total
}

const part2 = () => {
  const sampleAt = [40, 80, 120, 160, 200, 9999]
  let result = ''
  let row = ''
  let currentCycle = 1
  let iDuration = 0
  let x = 1
  let sampleIndex = 0
  let nextSample = sampleAt[sampleIndex++]
  const draw = () => {
    const pos = row.length
    row += Math.abs(x - pos) <= 1 ? '#' : '.'
  }
  for (const line of input) {
    let v = 0
    if (line.startsWith('addx ')) {
      iDuration = 2
      ;[v] = lib.ints(line)
    } else iDuration = 1
    for (let i = 0; i < iDuration; i++) {
      draw()
    }
    if (currentCycle + iDuration > nextSample) {
      if (currentCycle + iDuration > nextSample + 1) {
        result += row.substring(0, row.length - 1) + '\n'
        row = ''
        draw()
      } else {
        result += row + '\n'
        row = ''
      }
      nextSample = sampleAt[sampleIndex++]
    }

    x += v
    currentCycle += iDuration
  }
  return '\n' + result + row
}

console.log('part1:', part1())
console.log('part2:', part2())
