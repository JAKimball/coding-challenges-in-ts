import fs from 'fs'

// Synchronously read our data file
const input = fs.readFileSync('assets/aoc/2022/aoc2022-d1.txt', 'utf8')

type Elf = {
  totalCal: number
}

const elves: Array<Elf> = input.split('\n\n').map(value => ({
  totalCal: value.split('\n').reduce((a, v) => a + parseInt(v), 0),
}))

elves.sort((a, b) => b.totalCal - a.totalCal)

console.log('Maximum Calories:', elves[0].totalCal)

console.log('Top three total:', elves[0].totalCal + elves[1].totalCal + elves[2].totalCal)

//
