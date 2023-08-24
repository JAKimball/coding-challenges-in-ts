import fs from 'fs'

const [year, day] = ['2015', '5']

// const rawInput = fs.readFileSync(`assets/aoc/${year}/aoc${year}-d${day}-sample.txt`, 'utf8')
const rawInput = fs.readFileSync(`assets/aoc/${year}/aoc${year}-d${day}.txt`, 'utf8')
const input = rawInput.split('\n')

const countVowels = (str: string) => {
  const vowels = 'aeiou'
  let result = 0
  for (let i = 0; i < str.length; i++) {
    result += vowels.includes(str[i]) ? 1 : 0
  }
  return result
}

const hasDoubleLetter = (str: string) => {
  for (let i = 0; i < str.length - 1; i++) {
    if (str[i] === str[i + 1]) {
      return true
    }
  }
  return false
}

const hasNaughtyStrings = (str: string) => {
  const bad = ['ab', 'cd', 'pq', 'xy']
  for (let i = 0; i < bad.length; i++) {
    if (str.includes(bad[i])) {
      return true
    }
  }
  return false
}

const hasRepeatingPair = (str: string) => {
  for (let i = 0; i < str.length - 1; i++) {
    if (str.includes(str.slice(i, i + 2), i + 2)) {
      return true
    }
  }
  return false
}

const hasRepeatInTwo = (str: string) => {
  for (let i = 0; i < str.length - 2; i++) {
    if (str[i] === str[i + 2]) {
      return true
    }
  }
  return false
}

const part1 = () => {
  let total = 0
  input.forEach(line => {
    total += countVowels(line) >= 3 && hasDoubleLetter(line) && !hasNaughtyStrings(line) ? 1 : 0
  })
  return total
}

const part2 = () => {
  let total = 0
  input.forEach(line => {
    total += hasRepeatingPair(line) && hasRepeatInTwo(line) ? 1 : 0
  })
  return total
}

console.log('part1:', part1())
console.log('part2:', part2())
