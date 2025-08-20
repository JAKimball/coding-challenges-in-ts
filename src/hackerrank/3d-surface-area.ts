// Sample Input 0
//  [ 1 ]
// Sample Output 0
// 6

// Sample Input 1
// [
//   [ 1 3 4 ]
//   [ 2 2 3 ]
//   [ 1 2 4 ]
// [
// Sample Output 1
// 60

// O(n) - time

type Board = number[][]

const surfaceArea = (board: Board) => {
  let result = 0
  const H = board.length
  const W = board[0].length

  const cellHeight = (i: number, j: number) => {
    if (i >= 0 && i < H && j >= 0 && j < W) {
      return board[i][j]
    }
    return 0
  }

  const exposed = (selfHeight: number, otherHeight: number) => Math.max(0, selfHeight - otherHeight)

  for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
      const currentHeight = board[i][j]
      result += 2
      result += exposed(currentHeight, cellHeight(i - 1, j))
      result += exposed(currentHeight, cellHeight(i, j - 1))
      result += exposed(currentHeight, cellHeight(i + 1, j))
      result += exposed(currentHeight, cellHeight(i, j + 1))
    }
  }

  return result
}

/*
The above code is optimized for readability. Below, we attempt to 
optimize for performance with readability being a second priority.

An optimization attempt - also O(n) time but we reduce the 
per cell work by: 
- Adding the top and bottom surface area for all cells at once
  rather than per cell
- Maintaining the prior cell's height in a local variable (which
  an optimizing compiler should assign to a CPU register)
- Giving special treatment to edge cells outside of the loops
  rather than in them
- Above we measured each cell-to-cell boundary in two directions by the time
  we were done and used the difference only on the higher cells, whereas
  below we measure each cell-to-cell boundary only once and use the absolute
  value of the difference on all of them
- We eliminate the helper functions doing all inner loop work inline

The resulting code is usually at least twice as fast depending on inputs if called
a significant number of times.

Further optimization may be had by unrolling the loops.
*/

type SAFunction = typeof surfaceArea // ensure our function is interchangeable
const surfaceArea_Optimized: SAFunction = (board: Board) => {
  const H = board.length
  const firstRow = board[0]
  const lastRow = board[H - 1]
  const W = firstRow.length
  let result = H * W * 2

  let lastHeight = 0
  for (let j = 0; j < W; j++) {
    const currentHeight = firstRow[j]
    result += currentHeight + Math.abs(currentHeight - lastHeight) + lastRow[j]
    lastHeight = currentHeight
  }
  result += lastHeight

  for (let i = 1; i < H; i++) {
    let prevRow = board[i - 1]
    let currentRow = board[i]
    lastHeight = 0
    for (let j = 0; j < W; j++) {
      const currentHeight = currentRow[j]
      result += Math.abs(currentHeight - prevRow[j]) + Math.abs(currentHeight - lastHeight)
      lastHeight = currentHeight
    }
    result += lastHeight
  }

  return result
}

// Testing

type boardTest = [board: Board, shouldBe: number]
const testBoardData: boardTest[] = [
  [[[1]], 6],
  [[[2]], 10],
  [[[1, 1]], 10],
  [[[1], [1]], 10],
  [
    [
      [1, 3, 4],
      [2, 2, 3],
      [1, 2, 4],
    ],
    60,
  ],
  [
    [
      [1, 1, 4, 5, 2],
      [2, 5, 1, 5, 4],
      [4, 4, 3, 2, 1],
      [4, 1, 2, 2, 1],
      [5, 1, 2, 2, 1],
    ],
    158,
  ],
]

const functionVersions: SAFunction[] = [surfaceArea, surfaceArea_Optimized]

const TEST_ITERATIONS = 100_000

const testTimer = (f: () => void, iterations: number) => {
  const label = `${iterations} iterations`
  console.time(label)
  for (let i = 0; i < iterations; i++) {
    f()
  }
  console.timeEnd(label)
}

const doTest = (board: Board, shouldBe: number, testIterations: number = TEST_ITERATIONS) => {
  const H = board.length
  const W = board[0].length
  if (H * W <= 64) console.log(board)
  else console.log(H, 'X', W, 'Board')

  functionVersions.forEach(SAFunc => {
    const perfTestIteration = () => {
      SAFunc(board)
    }

    console.log(`${SAFunc.name}():`)
    const result = SAFunc(board)
    console.log(`  ==> ${result}`)

    const passed = result === shouldBe
    if (passed) {
      testTimer(perfTestIteration, testIterations)
    } else {
      console.error('error: result %d should be %d', result, shouldBe)
    }
  })

  console.log()
}

const testBoards = (testBoardData: boardTest[]) => {
  testBoardData.forEach(test => doTest(test[0], test[1]))
}

testBoards(testBoardData)

// Large array test

const makeBoard = (H: number = 10, W: number = 10, HeighLimit: number = 10) => {
  const result: Board = new Array(H)

  for (let i = 0; i < H; i++) {
    const row = new Array(W)
    for (let j = 0; j < W; j++) row[j] = (1 + Math.random() * HeighLimit) | 0
    result[i] = row
  }

  return result
}

const bigBoard = makeBoard(100, 100, 100)
const bigSurfaceArea = surfaceArea(bigBoard)

doTest(bigBoard, bigSurfaceArea, 1000)

/***************************
 * Example test template
 */

export function isTriangle(a: number, b: number, c: number): boolean {
  const sum = a + b + c
  return sum - 2 * Math.max(a, b, c) > 0
}

// in-source test suites
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('isTriangle tests', () => {
    it('should pass basic tests', () => {
      expect(isTriangle(1, 2, 2)).toBe(true)
      expect(isTriangle(7, 2, 2)).toBe(false)
      expect(isTriangle(1, 2, 3)).toBe(false)
    })
  })
}
