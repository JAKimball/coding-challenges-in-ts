import fs from 'fs'
import * as lib from '../../lib/index.js'

const [year, day, path] = ['2022', '11', 'src/aoc/2022/day-11-monkey-in-the-middle/']

// eslint-disable-next-line prefer-const
let testSample = false
// testSample = true
const fullPath = `${path}aoc${year}-d${day}${testSample ? '-sample' : ''}.txt`
const rawInput = fs.readFileSync(fullPath, 'utf8')

const input = rawInput.split('\n')
while (input[input.length - 1] === '') {
  input.pop()
}

const monkeys: Array<Monkey> = []
let monkeyTestDivisorLCM = 1

enum Operator {
  ADD = '+',
  SUBTRACT = '-',
  MULTIPLY = '*',
  DIVIDE = '/',
}

class Monkey {
  monkeyNumber: number
  items: Array<number>
  operationOperator: Operator
  operationParam: number | undefined // undefined for "old"
  testDivisor: number
  trueThrow: number
  falseThrow: number
  inspectionCount = 0
  worryDivisor = 3

  constructor(str: string, worryDivisor = 3) {
    const lines = str.split('\n')
    this.monkeyNumber = lib.ints(lines[0])[0]
    this.items = lib.ints(lines[1])
    this.operationParam = lib.ints(lines[2])[0]
    this.operationOperator = lines[2][23] as Operator
    this.testDivisor = lib.ints(lines[3])[0]
    monkeyTestDivisorLCM *= this.testDivisor
    this.trueThrow = lib.ints(lines[4])[0]
    this.falseThrow = lib.ints(lines[5])[0]
    this.worryDivisor = worryDivisor
  }

  catchItem = (item: number) => {
    this.items.push(item)
  }

  #processNextItem = () => {
    this.inspectionCount++
    let worry = this.items.shift() as number
    const param = this.operationParam ?? worry // undefined for "old"
    switch (this.operationOperator) {
      case Operator.ADD:
        worry += param
        break
      case Operator.SUBTRACT:
        worry -= param
        break
      case Operator.MULTIPLY:
        worry *= param
        break
      case Operator.DIVIDE:
        worry /= param
        break
    }
    // if (worry > Number.MAX_SAFE_INTEGER) console.warn('MAX_SAFE_INTEGER exceeded!')
    worry = Math.floor(worry / this.worryDivisor)
    worry = worry % monkeyTestDivisorLCM
    // The test
    monkeys[worry % this.testDivisor === 0 ? this.trueThrow : this.falseThrow].catchItem(worry)
  }

  processTurn = () => {
    while (this.items.length) {
      this.#processNextItem()
    }
  }
}

const loadMonkeys = (rawInput: string, worryDivisor = 3) => {
  monkeyTestDivisorLCM = 1
  monkeys.length = 0
  monkeys.push(...rawInput.split('\n\n').map(str => new Monkey(str, worryDivisor)))
}

const processRound = () => {
  for (const monkey of monkeys) {
    monkey.processTurn()
  }
}

const reportMonkeys = () => {
  for (let i = 0; i < monkeys.length; i++) {
    console.log(
      `Monkey ${i} - total inspections: ${monkeys[i].inspectionCount} item:`,
      monkeys[i].items
    )
  }
}

const part1 = () => {
  loadMonkeys(rawInput)
  // reportMonkeys()
  for (let round = 1; round <= 20; round++) {
    processRound()
    // console.log('Round:', round)
    // reportMonkeys()
  }

  const total = monkeys
    .map(v => v.inspectionCount)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((a, v) => a * v)
  return total
}

const part2 = () => {
  loadMonkeys(rawInput, 1)
  for (let round = 1; round <= 10000; round++) {
    processRound()
    // console.log('Round:', round)
    // reportMonkeys()
  }

  const total = monkeys
    .map(v => v.inspectionCount)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((a, v) => a * v)
  return total
}

console.log('part1:', part1())
console.log('part2:', part2())
