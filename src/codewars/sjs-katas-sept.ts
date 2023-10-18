// Seattle JS - Code Katas - September 2023
import { performance } from 'perf_hooks'

import { memoize } from '../dp/memoize.js'

export function capitalize(s: string) {
  let e = ''
  let o = ''
  for (let i = 0; i < s.length; i++) {
    e += i % 2 ? s[i].toLowerCase() : s[i].toUpperCase()
    o += i % 2 ? s[i].toUpperCase() : s[i].toLowerCase()
  }

  return [e, o]
}

capitalize('abcdef') // ?

// in-source test suites

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('capitalize() basic tests', function () {
    it('Testing for empty string', () => {
      assert.deepEqual(capitalize(''), ['', ''])
    })
    it('Testing for abcdef', () => {
      assert.deepEqual(capitalize('abcdef'), ['AbCdEf', 'aBcDeF'])
    })
    it('Testing for codewars', () => {
      assert.deepEqual(capitalize('codewars'), ['CoDeWaRs', 'cOdEwArS'])
    })
    it('Testing for abracadabra', () => {
      assert.deepEqual(capitalize('abracadabra'), ['AbRaCaDaBrA', 'aBrAcAdAbRa'])
    })
    it('Testing for codewarriors', () => {
      assert.deepEqual(capitalize('codewarriors'), ['CoDeWaRrIoRs', 'cOdEwArRiOrS'])
    })
    it('Testing for indexinglessons', () => {
      assert.deepEqual(capitalize('indexinglessons'), ['InDeXiNgLeSsOnS', 'iNdExInGlEsSoNs'])
    })
    it('Testing for codingisafunactivity', () => {
      assert.deepEqual(capitalize('codingisafunactivity'), [
        'CoDiNgIsAfUnAcTiViTy',
        'cOdInGiSaFuNaCtIvItY',
      ])
    })
  })
}

export function addLetters(...letters: string[]) {
  let sum = 0
  const codeOffset = 'a'.charCodeAt(0) - 1

  for (const c of letters) sum += c.charCodeAt(0) - codeOffset

  return String.fromCharCode(((sum + 25) % 26) + 1 + codeOffset)
}

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('Fixed tests', () => {
    const tests = [
      [['a', 'b', 'c'], 'f'],
      [['z'], 'z'],
      [['a', 'b'], 'c'],
      [['c'], 'c'],
      [['z', 'a'], 'a'],
      [['y', 'c', 'b'], 'd'],
      [[], 'z'],
    ]

    for (const test of tests) {
      const str = (test[0] as string[]).map((x: string) => `"${x}"`).join(', ')
      it(`addLetters(${str})`, () => {
        assert.strictEqual(addLetters(...test[0]), test[1])
      })
    }
  })
}

//=============

export function duplicateEncode1(word: string) {
  const charSet = new Set<string>()
  const multiSet = new Set<string>()
  const upWord = word.toUpperCase()
  let result = ''

  for (const c of upWord) charSet.has(c) ? multiSet.add(c) : charSet.add(c)
  for (const c of upWord) result += multiSet.has(c) ? ')' : '('

  return result
}

export function duplicateEncode(word: string) {
  const charIndex = new Map<string, number>()
  const upWord = word.toUpperCase()
  const result = []

  for (let i = 0; i < word.length; i++) {
    const c = upWord[i]
    const index = charIndex.get(c)
    if (index !== undefined) {
      result[index] = ')'
      result[i] = ')'
    } else {
      charIndex.set(c, i)
      result[i] = '('
    }
  }

  return result.join('')
}

const word = 'abcdefghijklmnopqrstuvwxyz'.repeat(10000)

const t0 = performance.now()
const result = duplicateEncode(word)
const t1 = performance.now()

console.log(`Execution time: ${t1 - t0} ms`)

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('example', function () {
    it('test', function () {
      assert.strictEqual(duplicateEncode('din'), '(((')
      assert.strictEqual(duplicateEncode('recede'), '()()()')
      assert.strictEqual(duplicateEncode('Success'), ')())())', 'should ignore case')
      assert.strictEqual(duplicateEncode('(( @'), '))((')
    })
  })

  describe('Random tests', () => {
    const randomTests = Array.from({ length: 1000 }, () => {
      const length = Math.floor(Math.random() * 100) + 1
      const word = Array.from({ length }, () => {
        const charCode = Math.floor(Math.random() * 26) + 97
        return Math.random() < 0.5
          ? String.fromCharCode(charCode)
          : String.fromCharCode(charCode).toUpperCase()
      }).join('')
      const upWord = word.toUpperCase()
      const expected = Array.from({ length }, (_, i) => {
        const char = upWord[i]
        return upWord.indexOf(char) === upWord.lastIndexOf(char) ? '(' : ')'
      }).join('')
      return [word, expected]
    })

    it('Testing 1000 random strings', () => {
      const results = randomTests.map(([word]) => duplicateEncode(word))
      const expected = randomTests.map(([, expected]) => expected)
      assert.deepEqual(results, expected)
    })
  })
}

//================

export function rgb(r: number, g: number, b: number): string {
  const part = (n: number) => Math.max(Math.min(n, 0xff), 0).toString(16).padStart(2, '0')

  return (part(r) + part(g) + part(b)).toUpperCase()
  // return [part(r), part(g), part(b)].join('').toUpperCase()
}

const part = (n: number) => Math.max(Math.min(n, 0xff), 0).toString(16).padStart(2, '0')

export function rgb2(r: number, g: number, b: number): string {
  return (part(r) + part(g) + part(b)).toUpperCase()
  // return [part(r), part(g), part(b)].join('').toUpperCase()
}

export function rgb3(r: number, g: number, b: number): string {
  function part(n: number) {
    return Math.max(Math.min(n, 0xff), 0).toString(16).padStart(2, '0')
  }

  return (part(r) + part(g) + part(b)).toUpperCase()
  // return [part(r), part(g), part(b)].join('').toUpperCase()
}

/*
  TODO: Look into why we get a V8 heap out of memory error when benchmarking
  with `(part(r) + part(g) + part(b)).toUpperCase()` and not with
  `[part(r), part(g), part(b)].join('').toUpperCase()` which is slower.
  Heap out of memory error occurs with after several million calls but there
  does seem to be a memory leak. But I need to find out if this is specific to
  vitest or if it is a V8 issue. Does benchmarking with jest or mocha have the
  same issue? Does running the code in node have the same issue? Does benchmarking
  suppress garbage collection? Many questions...
*/

rgb3(-1, 0xff, 0x100) // ?

if (import.meta.vitest) {
  const { assert, bench, describe, expect, it } = import.meta.vitest
  const rndTestValue = () => Math.ceil(Math.random() * 280 - 20)

  describe('Tests', function () {
    it('Basic Tests', function () {
      assert.strictEqual(rgb(0, 0, 0), '000000')
      assert.strictEqual(rgb(0, 0, -20), '000000')
      assert.strictEqual(rgb(300, 255, 255), 'FFFFFF')
      assert.strictEqual(rgb(173, 255, 47), 'ADFF2F')
    })
  })

  // bench(
  //   'rbg using sub arrow function',
  //   () => {
  //     rgb(-1, 0xff, 0x100)
  //   },
  //   { time: 3000, warmupTime: 500 }
  // )
  // bench(
  //   'rbg using global arrow function',
  //   () => {
  //     rgb2(-1, 0xff, 0x100)
  //   },
  //   { time: 3000, warmupTime: 500 }
  // )
  // bench(
  //   'rbg using sub-function',
  //   () => {
  //     rgb3(-1, 0xff, 0x100)
  //   },
  //   { time: 3000, warmupTime: 500 }
  // )
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
