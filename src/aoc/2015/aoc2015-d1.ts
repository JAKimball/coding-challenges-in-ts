import fs from 'fs'

// Synchronously read our data file
const input = fs.readFileSync('assets/aoc/2015/aoc2015-d1.txt', 'utf8')

let floor = 0

for (let i = 0; i < input.length; i++) {
  switch (input[i]) {
    case '(':
      floor++
      break
    case ')':
      floor--
      break
  }
}

console.log('final floor:', floor)

const enterBasementAt = () => {
  let i = 0
  let floor = 0
  while (i < input.length) {
    switch (input[i]) {
      case '(':
        floor++
        break
      case ')':
        if (--floor === -1) {
          return i + 1
        }
        break
    }
    i++
  }
}

console.log('entered basement at:', enterBasementAt())
//
