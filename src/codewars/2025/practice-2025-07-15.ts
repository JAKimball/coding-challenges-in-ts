import { performance } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

// My (@JAKimball) solutions to code katas from the July 2025 SJS katas

/**
 * Find the Missing Number
 * https://www.codewars.com/kata/57f5e7bd60d0a0cfd900032d
 */

/**
 * XOR from 0 to 100.
 * Mathematical shortcut: XOR of consecutive integers follows a pattern:
 * - If n % 4 == 0: result is n
 * - If n % 4 == 1: result is 1
 * - If n % 4 == 2: result is n + 1
 * - If n % 4 == 3: result is 0
 * For 0 to 100: since 100 % 4 == 0, XOR(0..100) = 100
 *
 * Reference: This is a well-known property in competitive programming.
 * See "Bit Manipulation" sections in algorithms books like:
 * - "Competitive Programming" by Halim & Halim
 * - GeeksforGeeks: "XOR of numbers from 1 to n"
 * - LeetCode discussions on missing number problems
 *
 * This solution is efficient with O(1) time complexity for the XOR calculation.
 *
 * @param {number} L - The left boundary of the range (inclusive).
 * @param {number} R - The right boundary of the range (inclusive).
 * @returns {number} - The XOR of all numbers from L to R.
 */

const xorRange = (L: number, R: number) => {
  // XOR of numbers from 1 to n
  const xorN = (n: number) => {
    if (n % 4 === 0) return n
    if (n % 4 === 1) return 1
    if (n % 4 === 2) return n + 1
    return 0
  }

  // XOR of numbers from L to R
  return xorN(L - 1) ^ xorN(R)
}

const XOR_0_TO_100 = xorRange(0, 100)

/**
 * Find the missing number in an array of numbers from 0 to 100.
 * The array contains all numbers except one.
 * @param {number[]} nums - An array of numbers from 0 to 100 with one number missing.
 * @returns {number} - The missing number.
 */
const missingNo = (nums: number[]): number => nums.reduce((a, v) => a ^ v) ^ XOR_0_TO_100

/**
 * Find the missing number in a range [L, R] given an array of numbers.
 * The array contains all numbers in the range except one.
 * @param {number} L - The left boundary of the range (inclusive).
 * @param {number} R - The right boundary of the range (inclusive).
 * @param {number[]} nums - An array of numbers in the range [L, R] with one number missing.
 * @returns {number} - The missing number in the range.
 */
const missingFromRange = (L: number, R: number, nums: number[]): number =>
  nums.reduce((a, v) => a ^ v, 0) ^ xorRange(L, R)

// in-source test suites
if (import.meta.vitest) {
  const { assert, describe, expect, it, suite } = import.meta.vitest

  // Test cases for missingNo and missingFromRange
  suite('missingNo and missingFromRange tests', () => {
    describe('Given test array tests', () => {
      // Initial arrays for testing
      let arr1 = [
        9, 45, 53, 10, 100, 30, 85, 72, 69, 93, 98, 27, 73, 82, 91, 60, 5, 79, 88, 18, 71, 36, 44,
        22, 89, 40, 59, 80, 81, 67, 25, 54, 13, 64, 56, 39, 48, 92, 84, 94, 87, 90, 77, 63, 32, 68,
        37, 96, 23, 0, 95, 1, 52, 78, 6, 57, 50, 2, 46, 19, 76, 47, 14, 4, 3, 29, 17, 11, 21, 24,
        74, 65, 12, 83, 28, 41, 66, 7, 58, 55, 51, 43, 97, 42, 86, 49, 31, 20, 75, 70, 34, 33, 38,
        8, 15, 62, 35, 61, 99, 16,
      ] // 26
      let arr2 = [
        26, 0, 75, 87, 33, 52, 37, 59, 27, 4, 54, 15, 24, 7, 21, 82, 98, 79, 34, 25, 1, 99, 5, 10,
        96, 97, 65, 85, 47, 28, 81, 70, 74, 11, 38, 45, 84, 13, 41, 2, 86, 39, 29, 43, 19, 31, 18,
        58, 14, 77, 69, 32, 6, 66, 61, 62, 50, 53, 8, 80, 72, 9, 68, 35, 42, 73, 83, 71, 92, 95, 63,
        51, 16, 17, 64, 22, 44, 91, 30, 76, 12, 3, 46, 60, 36, 56, 88, 89, 100, 78, 90, 49, 55, 48,
        23, 93, 57, 67, 20, 94,
      ] // 40
      let arr3 = [
        15, 60, 61, 95, 46, 38, 68, 11, 47, 45, 27, 23, 3, 16, 8, 81, 76, 63, 62, 57, 59, 22, 55,
        78, 28, 54, 74, 39, 79, 65, 48, 82, 17, 2, 98, 90, 18, 9, 56, 34, 7, 75, 10, 93, 35, 5, 73,
        77, 85, 71, 13, 91, 83, 70, 89, 4, 84, 14, 52, 99, 53, 33, 49, 42, 40, 58, 30, 36, 67, 72,
        41, 26, 87, 97, 25, 29, 50, 64, 21, 88, 66, 24, 94, 51, 1, 100, 0, 96, 69, 12, 92, 31, 37,
        6, 86, 32, 19, 44, 20, 43,
      ] // 80

      it('missingNo', () => {
        assert.strictEqual(missingNo(arr1), 26)
        assert.strictEqual(missingNo(arr2), 40)
        assert.strictEqual(missingNo(arr3), 80)
      })

      it('missingFromRange', () => {
        assert.strictEqual(missingFromRange(0, 100, arr1), 26)
        assert.strictEqual(missingFromRange(0, 100, arr2), 40)
        assert.strictEqual(missingFromRange(0, 100, arr3), 80)
      })
    })

    describe('Randomized tests', () => {
      const testCount = 1000
      const range = 100
      const shuffleArray = (arr: number[]) => {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr
      }

      // assert.strictEqual(missingNo(nums), missing)

      // Prepare an array of arrays with lengths [0..1000]
      const testArrays = Array.from({ length: testCount }, (_, i) => {
        const L = Math.floor(Math.random() * 1000)
        const R = L + i - 1
        const arr = Array.from({ length: i }, (_, j) => L + j)
        const missing = L + Math.floor(Math.random() * i)
        return [L, R, missing, shuffleArray(arr.filter(n => n !== missing))] as const
      })

      it('should find missing numbers in random arrays', () => {
        // skip the 0 length array
        for (let i = 1; i < testCount; i++) {
          const L = testArrays[i][0]
          const R = testArrays[i][1]
          const missing = testArrays[i][2]
          const nums = testArrays[i][3]
          // console.log(`Test ${i + 1}: L=${L}, R=${R}, missing=${missing}, nums=${nums}`)
          assert.strictEqual(missingFromRange(L, R, nums), missing)
        }
      })
    })
  })
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
