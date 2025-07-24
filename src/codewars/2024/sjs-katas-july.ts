import { performance } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

/**
 * Codewars Fizz/Buzz
 * https://www.codewars.com/kata/51dda84f91f5b5608b0004cc/train/javascript
 */

export const fizzBuzz = (n: number) => {
  n--
  let m15 = (n / 15) | 0
  let m3 = ((n / 3) | 0) - m15
  let m5 = ((n / 5) | 0) - m15

  return [m3, m5, m15]
}

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('fizzBuzz tests', () => {
    it('should pass basic tests', () => {
      assert.deepEqual(fizzBuzz(20), [5, 2, 1])
      assert.deepEqual(fizzBuzz(2), [0, 0, 0])
      assert.deepEqual(fizzBuzz(14), [4, 2, 0])
      assert.deepEqual(fizzBuzz(30), [8, 4, 1])
      assert.deepEqual(fizzBuzz(141), [37, 19, 9])
    })
  })
}

/**
 * Merge overlapping strings
 * https://www.codewars.com/kata/61c78b57ee4be50035d28d42/train/typescript
 */

export const mergeStrings = (first: string, second: string): string => {
  let p1 = 0

  while (p1 < first.length) {
    let p2 = 0
    while (p2 < second.length && p1 + p2 < first.length && first[p1 + p2] === second[p2]) p2++
    if (p1 + p2 >= first.length) return first + second.slice(p2)
    p1++
  }

  return first + second
}

// cspell:disable
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('mergeStrings', function () {
    it('"Example 1"', () => {
      const expected = 'abcdefgh'
      const actual = mergeStrings('abcde', 'cdefgh')
      assert.equal(actual, expected)
    })

    it('"Example 2"', () => {
      const expected = 'abaabab'
      const actual = mergeStrings('abaab', 'aabab')

      assert.equal(actual, expected)
    })
  })
}
// cspell:enable

/**
 * Highest Scoring Word
 * https://www.codewars.com/kata/57eb8fcdf670e99d9b000272/train/typescript
 */

const scoreOffset = 'a'.charCodeAt(0) - 1
const wordScore = (word: string) => {
  let result = 0
  for (let i = 0; i < word.length; i++) result += word.charCodeAt(i) - scoreOffset

  return result
}

export const high = (str: string): string => {
  let result = ''
  let bestScore = -Infinity

  const words = str.split(' ')

  for (const word of words) {
    const score = wordScore(word)
    if (score > bestScore) {
      bestScore = score
      result = word
    }
  }

  return result
}
// cspell:disable
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  const solutions = [
    ['man i need a taxi up to ubud', 'taxi'],
    ['what time are we climbing up the volcano', 'volcano'],
    ['take me to semynak', 'semynak'],
    ['massage yes massage yes massage', 'massage'],
    ['take two bintang and a dance please', 'bintang'],
    ['aa b', 'aa'],
    ['b aa', 'b'],
    ['bb d', 'bb'],
    ['d bb', 'd'],
    ['aaa b', 'aaa'],
  ]

  describe('Highest Scoring Word test', () => {
    it('works with test inputs', () => {
      solutions.forEach(([input, expected]) => {
        assert.strictEqual(high(input), expected)
      })
    })
  })
}
// cspell:enable

export const filter_list = (l: Array<any>) => l.filter(v => typeof v === 'number')

export const pigIt = (a: string) => a.replace(/\w+/g, s => s.slice(1) + s[0] + 'ay')

export const solution = (nums: number[]) => nums.sort((a: number, b: number) => a - b)

export const validBraces = (braces: string) => {
  const stack = []
  const match = new Map()
  match.set('(', ')')
  match.set('[', ']')
  match.set('{', '}')

  for (const c of braces)
    if (match.has(c)) stack.push(c)
    else if (c === '}' || c === ']' || c === ')')
      if (stack.length === 0 || c !== match.get(stack.pop())) return false

  return stack.length === 0
}

/**
 * Maximum subarray sum
 * https://www.codewars.com/kata/54521e9ec8e60bc4de000d6c/train/javascript
 */

const maxSequence = (arr: number[]) => {
  let localSum = 0
  let maxLocalSum = 0

  for (const x of arr) {
    localSum = Math.max(localSum + x, x)
    maxLocalSum = Math.max(maxLocalSum, localSum)
  }

  return maxLocalSum
}

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest

  describe('maxSequence test', () => {
    it('should work on an empty array', function () {
      assert.strictEqual(maxSequence([]), 0)
    })
    it('should work on the example', function () {
      assert.strictEqual(maxSequence([-2, 1, -3, 4, -1, 2, 1, -5, 4]), 6)
    })
  })
}
