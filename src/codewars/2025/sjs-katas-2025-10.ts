import { performance } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

/**
 * Codewars: Find the capitals
 * https://www.codewars.com/kata/539ee3b6757843632d00026b/train/typescript
 */

const capitals = (word: string) =>
  [...word]
    .map((c, i) => [c.charCodeAt(0) < 97, i])
    .filter(tup => tup[0])
    .map(tup => tup[1])

/**
 * Codewars: The Hashtag Generator
 * https://www.codewars.com/kata/52449b062fb80683ec000024/train/typescript
 */

const capitalWord = (word: string) => {
  if (word === '') return ''
  return word[0].toUpperCase() + word.slice(1)
}

function generateHashtag(str: string) {
  const words = str.match(/\w+/g)
  if (!words) return false
  const tag = words.map(capitalWord).join('')
  return tag.length >= 140 ? false : '#' + tag
}

generateHashtag(' Hello there thanks for trying my Kata') //?

/**
 * Codewars: Unique In Order
 * https://www.codewars.com/kata/54e6533c92449cc251001667/train/typescript
 */

export const uniqueInOrder = (iterable: (number | string)[] | string) =>
  [...iterable].filter((el, i, arr) => i === 0 || el !== arr[i - 1])

// cspell:disable
uniqueInOrder('AAAABBBCCDAABBB') //?
uniqueInOrder('AAAABBBCCDAABBB') //?
uniqueInOrder('ABBCcAD') //?
uniqueInOrder([1, 2, 2, 3, 3]) //?
// cspell:enable

/***************************
 * Example test template
 */

// cspell:disable
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
// cspell:enable
