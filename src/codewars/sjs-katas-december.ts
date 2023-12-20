import { performance } from 'perf_hooks'

import { memoize } from '../dp/memoize.js'

/***************************
 * Fix string case
 * https://www.codewars.com/kata/5b180e9fedaa564a7000009a
 *
 */

export function solveTS(s: string) {
  const lower = s.toLowerCase()

  let lowerCount = 0
  for (const i in s as unknown as object) if (s[Number(i)] === lower[Number(i)]) lowerCount++

  if (lowerCount * 2 >= s.length) return lower
  return s.toUpperCase()
}

export function solve(s: string) {
  const lower = s.toLowerCase()

  let lowerCount = 0
  for (let i = 0; i < s.length; i++) if (s[i] === lower[i]) lowerCount++

  if (lowerCount * 2 >= s.length) return lower
  return s.toUpperCase()
}

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('Basic tests', function () {
    it('Testing for code', () => {
      assert.strictEqual(solve('code'), 'code')
    })
    it('Testing for CODe', () => {
      assert.strictEqual(solve('CODe'), 'CODE')
    })
    it('Testing for COde', () => {
      assert.strictEqual(solve('COde'), 'code')
    })
    it('Testing for Code', () => {
      assert.strictEqual(solve('Code'), 'code')
    })
  })
}

/***************************
 * Build Tower
 * https://www.codewars.com/kata/576757b1df89ecf5bd00073b
 *
 */

export const towerBuilder = (nFloors: number): string[] => {
  const result: string[] = []

  for (let level = 0; level < nFloors; level++) {
    const pad = ' '.repeat(nFloors - 1 - level)
    result[level] = `${pad}${'*'.repeat(1 + level * 2)}${pad}`
  }

  return result
}

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('towerBuilder', () => {
    it('test', () => {
      assert.deepStrictEqual(towerBuilder(1), ['*'])
      assert.deepStrictEqual(towerBuilder(2), [' * ', '***'])
      assert.deepStrictEqual(towerBuilder(3), ['  *  ', ' *** ', '*****'])
    })
  })
}

/***************************
 * Highest and Lowest
 * https://www.codewars.com/kata/554b4ac871d6813a03000035
 *
 */

function highAndLow(numbers: string) {
  const [high, low] = numbers.split(' ').reduce(
    ([h, l], nStr) => {
      const n = parseInt(nStr)
      if (n > h) h = n
      if (n < l) l = n
      return [h, l]
    },
    [-Infinity, Infinity]
  )

  return `${high} ${low}`
}

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('highAndLow', () => {
    it('Test 1', function () {
      assert.strictEqual(highAndLow('8 3 -5 42 -1 0 0 -9 4 7 4 -4'), '42 -9')
    })
    it('Test 2', function () {
      assert.strictEqual(highAndLow('1 2 3'), '3 1')
    })
  })
}

/***************************
 * Perimeter of squares in a rectangle
 * https://www.codewars.com/kata/559a28007caad2ac4e000083
 *
 */

const fib = (n: number) => {
  let [a, b] = [0, 1]
  while (n > 0) {
    ;[a, b] = [b, a + b]
    n--
  }

  return a
}

export const perimeter = (n: number): number => {
  return 4 * (fib(n + 3) - 1)
}

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('perimeter', () => {
    it('Basic tests', () => {
      assert.strictEqual(perimeter(5), 80)
      assert.strictEqual(perimeter(7), 216)
      assert.strictEqual(perimeter(20), 114624)
      assert.strictEqual(perimeter(30), 14098308)
    })
  })
}
