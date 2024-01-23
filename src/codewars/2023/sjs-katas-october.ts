import { performance } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

/***************************
 * https://www.codewars.com/kata/56747fd5cb988479af000028/train/typescript
 * Get the Middle Character
 */

export function getMiddle(s: string) {
  const len2 = s.length / 2
  return s.length % 2 ? s[Math.floor(len2)] : s.slice(len2 - 1, len2 + 1)
}

// in-source test suites

if (import.meta.vitest) {
  function test(string: string, expected: string) {
    assert.strictEqual(getMiddle(string), expected)
  }

  const { assert, describe, expect, it } = import.meta.vitest
  describe('getMiddle', function () {
    it('should handle basic tests', function () {
      test('test', 'es')
      test('testing', 't')
    })
  })
}

/*
https://www.codewars.com/kata/54ff3102c1bad923760001f3/train/typescript
*/

const vowelTest = [] as boolean[]

for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
  vowelTest[i] = 'aeiou'.includes(String.fromCharCode(i))
  vowelTest[' '.charCodeAt(0)]
}

export class Kata {
  static getCount(str: string): number {
    let result = 0
    for (let i = 0; i < str.length; i++) {
      vowelTest[str.charCodeAt(i)] ? result++ : 0
    }

    return result
  }
}

// in-source test suites
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('getCount', function () {
    it('should pass a sample test', function () {
      assert.strictEqual(Kata.getCount('abracadabra'), 5)
    })
  })
}

/***************************
 * First non-repeating character
 *
 */

function firstNonRepeatingLetter(s: string) {
  const map = new Map<string, number>()
  const lc_s = s.toLocaleLowerCase()

  for (const c of lc_s) {
    const n = map.get(c)
    map.set(c, n ? n + 1 : 1)
  }

  for (let i = 0; i < s.length; i++) {
    if (map.get(lc_s[i]) === 1) return s[i]
  }

  return ''
}

// in-source test suites
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('firstNonRepeatingLetter', function () {
    it('should handle simple tests', function () {
      assert.strictEqual(firstNonRepeatingLetter('a'), 'a')
      assert.strictEqual(firstNonRepeatingLetter('stress'), 't')
      assert.strictEqual(firstNonRepeatingLetter('moonmen'), 'e')
    })
  })
}

/****************************
 * Who likes this?
 */

export const likes = (a: string[]) => {
  switch (a.length) {
    case 0:
      return `no one likes this`
    case 1:
      return `${a[0]} likes this`
    case 2:
      return `${a[0]} and ${a[1]} like this`
    case 3:
      return `${a[0]}, ${a[1]} and ${a[2]} like this`
    default:
      return `${a[0]}, ${a[1]} and ${a.length - 2} others like this`
  }
}

// in-source test suites
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('likes: static tests', function () {
    it('should return correct text', function () {
      assert.equal(likes([]), 'no one likes this')
      assert.equal(likes(['Peter']), 'Peter likes this')
      assert.equal(likes(['Jacob', 'Alex']), 'Jacob and Alex like this')
      assert.equal(likes(['Max', 'John', 'Mark']), 'Max, John and Mark like this')
      assert.equal(likes(['Alex', 'Jacob', 'Mark', 'Max']), 'Alex, Jacob and 2 others like this')
    })
  })
}

/***************************
 * Example test template

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

*/
