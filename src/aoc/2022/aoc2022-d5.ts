import fs from 'fs'
import * as lib from '../lib/index.js'

// const rawInput = fs.readFileSync('assets/aoc/2022/aoc2022-d5-sample.txt', 'utf8')
const rawInput = fs.readFileSync('assets/aoc/2022/aoc2022-d5.txt', 'utf8')
const [rawStacks, rawMoves] = rawInput.split('\n\n')

const moves = rawMoves.split('\n')

const parseStacks = (rawStacks: string): string[][] => {
  const stackCount = lib.ints(rawStacks).length
  const stacks: string[][] = []
  for (let i = 0; i < stackCount; i++) {
    stacks[i] = []
  }
  const lines = rawStacks.split('\n')
  for (let i = 0; i < lines.length - 1; i++) {
    for (let j = 0; j < stackCount; j++) {
      const crate = lines[i][1 + j * 4]
      if (crate !== ' ') {
        stacks[j].unshift(crate)
      }
    }
  }
  return stacks
}

const part1 = () => {
  const stacks = parseStacks(rawStacks)
  moves.forEach(command => {
    const [n, f, t] = lib.ints(command)
    let i = n
    while (i--) {
      stacks[t - 1].push(stacks[f - 1].pop() as string)
    }
  })
  let message = ''
  stacks.forEach(stack => (message += stack[stack.length - 1]))
  return message
}

const part2 = () => {
  const stacks = parseStacks(rawStacks)
  moves.forEach(command => {
    const [n, f, t] = lib.ints(command)
    stacks[t - 1].push(...stacks[f - 1].splice(-n))
  })
  let message = ''
  stacks.forEach(stack => (message += stack[stack.length - 1]))
  return message
}

console.log('part1:', part1())
console.log('part2:', part2())
