import { performance } from 'perf_hooks'
import { memoize } from '../../dp/memoize.js'

// My (@JAKimball) solutions to code katas from the march 2025 SJS katas

/***************************
 * Find Fibonacci last digit
 * https://www.codewars.com/kata/56b7251b81290caf76000978/train/javascript
 *
 */

const getLastDigit = (index: number) => {
  let [a, b] = [0, 1]

  while (index > 0) {
    ;[a, b] = [b, (a + b) % 10]
    index--
  }

  return a
}

let PISANO_PERIOD: number[] = []

;(() => {
  let [a, b] = [0, 1]

  do {
    PISANO_PERIOD.push(a)
    ;[a, b] = [b, (a + b) % 10]
  } while (a !== 0 || b !== 1)
})()

const getLastDigitPisano = (index: number) => PISANO_PERIOD[index % PISANO_PERIOD.length]

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

  // Find Fibonacci last digit tests

  // getLastDigit tests
  describe('getLastDigit tests', () => {
    it('should pass basic tests', () => {
      expect(getLastDigit(193150)).toBe(5)
      expect(getLastDigit(300)).toBe(0)
      expect(getLastDigit(20001)).toBe(6)
    })
  })

  // getLastDigitPisano tests
  describe('getLastDigitPisano tests', () => {
    it('should pass basic tests', () => {
      expect(getLastDigitPisano(193150)).toBe(5)
      expect(getLastDigitPisano(300)).toBe(0)
      expect(getLastDigitPisano(20001)).toBe(6)
    })
  })

  describe('isTriangle tests', () => {
    it('should pass basic tests', () => {
      expect(isTriangle(1, 2, 2)).toBe(true)
      expect(isTriangle(7, 2, 2)).toBe(false)
      expect(isTriangle(1, 2, 3)).toBe(false)
    })
  })
}
