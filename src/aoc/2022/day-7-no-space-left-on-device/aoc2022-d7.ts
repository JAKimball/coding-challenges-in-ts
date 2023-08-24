import fs from 'fs'
import * as lib from '../../lib/index.js'

const [year, day, path] = ['2022', '7', 'src/aoc/2022/day-7-no-space-left-on-device/']

// const rawInput = fs.readFileSync(`${path}aoc${year}-d${day}-sample.txt`, 'utf8')
const rawInput = fs.readFileSync(`${path}aoc${year}-d${day}.txt`, 'utf8')
// const inputArray = rawInput.split('\n')

type EvalFn = (dirSize: number) => void

// Assume that the input will walk the tree consistently so we don't have to build one.
// Just leverage the call stack...
const readDir = (evalFn: EvalFn): number => {
  let dirSize = 0
  lib.readLn() // ls
  let line: string | undefined
  while ((line = lib.readLn())) {
    if (line.startsWith('$')) {
      if (line === '$ cd ..') {
        break
      }
      dirSize += readDir(evalFn) // cd <dir>
    } else {
      if (!line.startsWith('dir')) {
        dirSize += lib.ints(line)[0]
      }
    }
  }
  evalFn(dirSize)
  return dirSize
}

let totalUsedSize = 0

const part1 = () => {
  let totalSmallDirSize = 0

  const evalFn = (dirSize: number) => {
    if (dirSize <= 100_000) {
      totalSmallDirSize += dirSize
    }
  }

  lib.initReadLn(rawInput)
  while (lib.readLn()) {
    totalUsedSize = readDir(evalFn)
  }
  return totalSmallDirSize
}

const part2 = () => {
  const totalSystemSize = 70_000_000
  const neededSpace = 30_000_000
  const unusedSpace = totalSystemSize - totalUsedSize
  const freeAtLeast = neededSpace - unusedSpace
  let smallestLargeEnough = Infinity

  const evalFn = (dirSize: number) => {
    if (dirSize >= freeAtLeast && dirSize < smallestLargeEnough) {
      smallestLargeEnough = dirSize
    }
  }

  lib.initReadLn(rawInput)
  while (lib.readLn()) {
    readDir(evalFn)
  }
  return smallestLargeEnough
}

console.log('part1:', part1())
console.log('part2:', part2())
