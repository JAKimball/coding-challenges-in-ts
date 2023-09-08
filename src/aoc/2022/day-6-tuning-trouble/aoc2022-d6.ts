import fs from 'fs'

// import * as lib from '../../lib/index.js'

const [year, day, path] = ['2022', '6', 'src/aoc/2022/day-6-tuning-trouble/']

// const rawInput = fs.readFileSync(`${path}aoc${year}-d${day}-sample.txt`, 'utf8')
const rawInput = fs.readFileSync(`${path}aoc${year}-d${day}.txt`, 'utf8')
// const [raw1, raw2] = rawInput.split('\n\n')
const input = rawInput

let matchCount = 0
const matches = new Map<string, number>()

const add = (c: string): void => {
  if (matches.has(c)) {
    const count = matches.get(c) ?? 0
    matches.set(c, count + 1)
    if (count > 0) {
      matchCount++
    }
  } else {
    matches.set(c, 1)
  }
}

const remove = (c: string): void => {
  let count = matches.get(c) ?? 0
  matches.set(c, --count)
  if (count > 0) {
    matchCount--
  }
}

const findMarker = (len: number): number => {
  for (let i = 0; i < len; i++) {
    add(input[i])
  }

  let i = len
  while (matchCount && i < input.length) {
    add(input[i])
    remove(input[i - len])
    i++
  }

  for (let j = i - len; j < i; j++) {
    remove(input[j])
  }

  return i
}

const part1 = () => {
  return findMarker(4)
}

const part2 = () => {
  return findMarker(14)
}

console.log('part1:', part1())
console.log(matchCount)

console.log('part2:', part2())
