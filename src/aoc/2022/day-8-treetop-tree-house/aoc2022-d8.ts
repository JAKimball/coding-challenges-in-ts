import fs from 'fs'

const [year, day, path] = ['2022', '8', 'src/aoc/2022/day-8-treetop-tree-house/']

// const rawInput = fs.readFileSync(`${path}aoc${year}-d${day}-sample.txt`, 'utf8')
const rawInput = fs.readFileSync(`${path}aoc${year}-d${day}.txt`, 'utf8')

const input = rawInput.split('\n')
if (input[input.length - 1] === '') {
  input.pop()
}

const part1 = () => {
  const visible: Set<string> = new Set()
  const checkTreeVisibility = (r: number, c: number, blockingHeight: number): number => {
    const height = parseInt(input[r][c])
    if (height > blockingHeight) {
      blockingHeight = height
      visible.add(`${r}:${c}`)
    }
    return blockingHeight
  }

  const rows = input.length
  const cols = input[0].length
  let blockingHeight: number
  // arrive at each tree from all four directions
  for (let r = 0; r < rows; r++) {
    blockingHeight = -Infinity
    for (let c = 0; c < cols; c++) {
      blockingHeight = checkTreeVisibility(r, c, blockingHeight)
    }
    blockingHeight = -Infinity
    for (let c = cols - 1; c; c--) {
      blockingHeight = checkTreeVisibility(r, c, blockingHeight)
    }
  }
  for (let c = 0; c < cols; c++) {
    blockingHeight = -Infinity
    for (let r = 0; r < rows; r++) {
      blockingHeight = checkTreeVisibility(r, c, blockingHeight)
    }
    blockingHeight = -Infinity
    for (let r = rows - 1; r; r--) {
      blockingHeight = checkTreeVisibility(r, c, blockingHeight)
    }
  }
  return visible.size
}

const part2 = () => {
  const heightLastAt = Array(10)
  const rows = input.length
  const cols = input[0].length
  const scores: number[][] = Array(rows)
  for (let r = 0; r < rows; r++) {
    scores[r] = Array(cols).fill(1)
  }

  let pos: number
  const factorTreeView = (r: number, c: number) => {
    const height = parseInt(input[r][c])
    let nearestBlocker = 0
    for (let i = height; i <= 9; i++) {
      if (heightLastAt[i] > nearestBlocker) {
        nearestBlocker = heightLastAt[i]
      }
    }
    if (heightLastAt[i] > nearestBlocker) {
      nearestBlocker = heightLastAt[i]
    }
    heightLastAt[height] = pos
    scores[r][c] *= pos - nearestBlocker
    pos++
  }
  // arrive at each tree from all four directions
  let bestViewScore = 0
  for (let r = 0; r < rows; r++) {
    heightLastAt.fill(0)
    pos = 0
    for (let c = 0; c < cols; c++) {
      factorTreeView(r, c)
    }
    heightLastAt.fill(0)
    pos = 0
    for (let c = cols - 1; c; c--) {
      factorTreeView(r, c)
    }
  }
  for (let c = 0; c < cols; c++) {
    heightLastAt.fill(0)
    pos = 0
    for (let r = 0; r < rows; r++) {
      factorTreeView(r, c)
    }
    heightLastAt.fill(0)
    pos = 0
    for (let r = rows - 1; r; r--) {
      factorTreeView(r, c)
      if (scores[r][c] > bestViewScore) {
        bestViewScore = scores[r][c]
      }
    }
  }

  return bestViewScore
}

console.log('part1:', part1())
console.log('part2:', part2())
