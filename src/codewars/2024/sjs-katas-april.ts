import { performance } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

function addBinary(a: number, b: number) {
  return (a + b).toString(2)
}

// cspell:words tribonacci
// https://www.codewars.com/kata/556deca17c58da83c00002db/train/typescript
export function tribonacci([a, b, c]: [number, number, number], n: number): number[] {
  const result = [a, b, c]

  if (n <= 3) {
    result.length = n
    return result
  }

  do {
    ;[a, b, c] = [b, c, a + b + c]
    result.push(c)
    n--
  } while (n > 3)

  return result
}

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
