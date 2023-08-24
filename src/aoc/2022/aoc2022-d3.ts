import fs from 'fs'

// Synchronously read our data file
const input = fs.readFileSync('assets/aoc/2022/aoc2022-d3.txt', 'utf8')

let totalPriority = 0

const itemPriority = (item: string): number => {
  if (item[0] >= 'a' && item[0] <= 'z') {
    return item.charCodeAt(0) - 'a'.charCodeAt(0) + 1
  }
  if (item[0] >= 'A' && item[0] <= 'Z') {
    return item.charCodeAt(0) - 'A'.charCodeAt(0) + 27
  }
  return 0
}

input.split('\n').forEach(rs => {
  const midPoint = rs.length / 2
  let i = midPoint
  while (i--) {
    if (rs.indexOf(rs[i], midPoint) !== -1) {
      totalPriority += itemPriority(rs[i])
      return
    }
  }
})

console.log('sum of the priorities', totalPriority)

totalPriority = 0

const commonLetters = (st1: string, st2: string) => {
  let result = ''
  for (let i = 0; i < st1.length; i++) {
    if (st2.indexOf(st1[i]) !== -1) {
      result += st1[i]
    }
  }
  if (st2.indexOf(st1[i]) !== -1) {
    result += st1[i]
  }
  return result
}

const inputArray = input.split('\n')

let i = 0
while (i < inputArray.length) {
  totalPriority += itemPriority(
    commonLetters(commonLetters(inputArray[i], inputArray[i + 1]), inputArray[i + 2])
  )
  i = i + 3
}

console.log('sum of the badge priorities', totalPriority)

//
