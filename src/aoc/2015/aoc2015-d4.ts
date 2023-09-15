import crypto from 'crypto'
import fs from 'fs'

// const rawInput = fs.readFileSync('assets/aoc/2015/aoc2015-d4-sample.txt', 'utf8')
const rawInput = fs.readFileSync('assets/aoc/2015/aoc2015-d4.txt', 'utf8')
const input = rawInput.split('\n')

const firstNonZero = (str: string) => {
  let i = 0
  while (i < str.length && str[i] === '0') {
    i++
  }

  return i
}

const part1 = () => {
  const hash = crypto.createHash('md5')
  for (let i = 0; ; i++) {
    const clone = hash.copy()
    if (firstNonZero(clone.update(input[0] + i).digest('hex')) >= 5) {
      return i
    }
  }
}

const part2 = () => {
  const hash = crypto.createHash('md5')
  for (let i = 0; ; i++) {
    const clone = hash.copy()
    if (firstNonZero(clone.update(input[0] + i).digest('hex')) >= 6) {
      return i
    }
  }
}

console.log('2015 day 4')
console.log('part1:', part1())
console.log('part2:', part2())
//
