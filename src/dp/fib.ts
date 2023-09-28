import { memoize } from '../dp/memoize.js'

export const fib = memoize((n: number): bigint => {
  if (n <= 2) return 1n
  return fib(n - 2) + fib(n - 1)
})

export const testFib = () => {
  console.time()
  console.log(fib(6))
  console.log(fib(50))
  // console.log(fib(400));
  console.timeEnd()

  // console.log(fib, fib.stats.savings)
}

export const hailstone = memoize((n: number): number => {
  return n <= 1 ? 1 : 1 + (n % 2 ? hailstone(n * 3 + 1) : hailstone(n / 2))
})

export const hailstone2 = memoize((n: number): number => {
  // take advantage of the fact that an odd number always leads to an even number
  return n <= 1 ? 1 : n % 2 ? 2 + hailstone2((n * 3 + 1) / 2) : 1 + hailstone2(n / 2)
})

export const gridTraveler = memoize((height: number, width: number): number => {
  if (height === 1 || width === 1) return 1

  const normalizeGT = (nHeight: number, nWidth: number) => {
    // Swap if height > width to leverage memoization of symmetry in the problem
    if (nHeight > nWidth) {
      const swap = nHeight
      nHeight = nWidth
      nWidth = swap
    }

    return gridTraveler(nHeight, nWidth)
  }

  return normalizeGT(height - 1, width) + normalizeGT(height, width - 1)
})

export const testGridTraveler = () => {
  let gt = 0
  console.time('gridTraveler')
  gt = gridTraveler(5, 5)
  gt
  // gt = gridTraveler(4, 4); gt
  gt = gridTraveler(18, 18)
  gt
  console.timeEnd('gridTraveler')

  const hc = gridTraveler.stats.hitCount
  hc
  const mc = gridTraveler.stats.missCount
  mc
  const total = hc + mc
  total

  console.log(gridTraveler)
}

// ====================================================

export const numWays = memoize((height: number, strides: number[]): number => {
  if (height === 0) return 1
  if (height <= 0) return 0

  let ways = 0
  strides.forEach(stride => {
    ways += numWays(height - stride, strides)
  })
  return ways
})

export const testNumWays = () => {
  // console.log(numWays(0, [1, 2]));
  // console.log(numWays(1, [1, 2]));
  console.log(numWays(2, [1, 2]))
  // console.log(numWays(3, [1, 2]));
  console.log(numWays(4, [1, 2]))
  // console.log(numWays(5, [1, 2]));
  // // console.log(numWays(40, [1, 2]));
  // // console.log(fib(41));
  // console.log(numWays(50, [1, 2]));
  // // console.log(fib(51));
  // console.log(numWays.toString());

  console.log(numWays(4, [1, 3, 5]))

  console.log(fib(1))
  console.log(fib(2))
  console.log(fib(3))
  console.log(fib(4))
  console.log(fib(5))

  const ϕ = (1 + Math.sqrt(5)) / 2
  ϕ
  const n = 39
  const strides = [1, 2]
  console.log(numWays(n, strides))

  let ratio = numWays(n + 1, strides) / numWays(n, strides)
  console.log(ratio)
  console.log(ratio === ϕ)

  ratio = Number(fib(41)) / Number(fib(40))
  console.log(ratio)
  console.log(ratio === ϕ)

  console.log(numWays)

  enum TestResult {
    Fail = 'Fail',
    Pass = 'Pass',
  }

  const numWays_test = (): TestResult => {
    return TestResult.Fail // TODO: write test
  }
}

// https://youtube.com/clip/Ugy2Vl7h0w8BQHTCOKJ4AaABCQ

export const decodeStr = (coded: string): string => {
  let result = ''
  let i = 0
  let char = ''
  let repeat = 0

  while (i <= coded.length - 1) {
    if (coded[i] >= '0' && coded[i] <= '9') {
      repeat = repeat * 10 + Number(coded[i])
    } else {
      while (repeat--) {
        result += char
      }

      char = coded[i]
      result += char
      repeat = 0
    }

    i++
  }

  while (repeat--) {
    result += char
  }

  return result
}

export const encodeStr = (inStr: string): string => {
  let result = ''
  let i = 0
  let char = ''
  let repeat = 0

  while (i <= inStr.length - 1) {
    if (inStr[i] === char) {
      repeat++
    } else {
      if (repeat) {
        result += String(repeat)
        repeat = 0
      }

      char = inStr[i]
      result += char
    }

    i++
  }

  if (repeat) {
    result += String(repeat)
  }

  return result
}

const codedStr = encodeStr('abchijjklmmmmmmmmmmmmr')
// console.log(codedStr)

class BTNode {
  left: BTNode | undefined
  right: BTNode | undefined
  value: unknown
  constructor(value: unknown, left?: BTNode, right?: BTNode) {
    this.value = value
    this.left = left
    this.right = right
  }

  boundary(leftSide = true, rightSide = true) {
    let result: unknown[] = []
    const include = leftSide
    if (include) result.push(this.value)
    if (this.left) {
      result = result.concat(this.left.boundary(leftSide, false))
    }

    if (this.right) {
      result = result.concat(this.right.boundary(false, rightSide))
    }

    if (!include && (rightSide || (!this.left && !this.right))) result.push(this.value)
    return result
  }
}

export const node = new BTNode('a', new BTNode('b'), new BTNode('c'))
if (node.left) {
  node.left.left = new BTNode('d', new BTNode('h'), new BTNode('i'))
  node.left.right = new BTNode('e', new BTNode('j'), new BTNode('k'))
}

if (node.right) {
  node.right.left = new BTNode('f')
  node.right.right = new BTNode('g', new BTNode('n'), new BTNode('o'))
}

export const boundary_test = () => {
  console.log(node.boundary())
}

/**
 * Returns the sum of integers missing between the lowest and highest integers in the input list.
 * @param list
 * @returns sun of missing integers
 */
export const missing = (list: number[]) => {
  const lowest = Math.min(...list)
  const highest = Math.max(...list)

  let sum = 0
  for (const item of list) sum += item

  const n = highest - lowest + 1
  return (n * (highest + lowest)) / 2 - sum
}

export const digitCount = (n: number) => (n ? Math.floor(Math.log10(Math.abs(n))) + 1 : 1)

console.log(`Node: ${process.version}`)
// debugger
