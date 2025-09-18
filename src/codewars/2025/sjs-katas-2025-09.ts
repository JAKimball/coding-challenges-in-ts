import { performance } from 'perf_hooks'
import { memoize } from '../../dp/memoize.js'

export function removeDuplicateWords(s: string): string {
  const words = s.split(' ')
  const set = new Set(words)

  return [...set].join(' ')
}

export const removeDuplicateWords_golf = (s: string) => [...new Set(s.split(' '))].join(' ')

// ==========

export function sortMyString(s: string): string {
  let evens: string[] = []
  let odds: string[] = []

  for (let i = 0; i < s.length; i++) {
    if (i % 2) odds.push(s[i])
    else evens.push(s[i])
  }

  return [...evens, ' ', ...odds].join('')
}

// ==========

export function comp(a1: number[] | null, a2: number[] | null): boolean {
  if (!a1 || !a2) return false
  if (a1.length !== a2.length) return false

  const sortedA1 = a1.toSorted((a, b) => a - b)
  const sortedA2 = a2.toSorted((a, b) => a - b)

  for (let i = 0; i < a1.length; i++) {
    if (sortedA1[i] ** 2 !== sortedA2[i]) return false
  }

  return true
}

export function comp_fromArray(a1: number[] | null, a2: number[] | null): boolean {
  if (!a1 || !a2) return false
  if (a1.length !== a2.length) return false

  const sortedA1 = Array.from(a1).sort((a, b) => a - b)
  const sortedA2 = Array.from(a2).sort((a, b) => a - b)

  for (let i = 0; i < a1.length; i++) {
    if (sortedA1[i] ** 2 !== sortedA2[i]) return false
  }

  return true
}

// ==========

const trunc10 = (n: number, d: number) => {
  const scale = 10 ** d
  return Math.trunc(Math.trunc(n / scale) * scale)
}

const digit10 = (n: number, i: number) => trunc10(n, i) - trunc10(n, i + 1)
const span10 = (n: number, l: number, h: number) => (l ? trunc10(n, l) : n) - trunc10(n, h)
const mod10 = (n: number, h: number) => n - trunc10(n, h)
const mod10_2 = (n: number, h: number) => n % 10 ** h

trunc10(4567811, 0) //?
digit10(4567825, 0) //?
digit10(4567825, 4) //?
span10(4567825, 2, 4) //?
span10(4567825, 0, 4) //?
mod10(4567825, 2) //?
mod10_2(4567825, 2) //?

export function smallest(n: number): number[] {
  let digits = [...n.toFixed(0)].map(Number)
  let vTo = digits[0]
  let iTo = 1
  let vFrom = vTo
  let iFrom = 0

  while (iTo < digits.length) {
    const v = digits[iTo]
    console.log(v)
    //   if (v < vMin) {
    //     vMin = v
    //     iMin = i
    //   } else if (v < v2nd) {
    //     v2nd = v
    //     i2nd = i
    //   }
  }

  let from = 0
  let to = 0

  // console.log(iMin, i2nd)
  // if (iMin === 0) {
  //   ;[from, to] = [i2nd, 1]
  // } else {
  //   ;[from, to] = [iMin, 0]
  // }
  // console.log(from, to)

  let outDigits = [
    ...digits.slice(0, to),
    digits[from],
    ...digits.slice(to, from),
    ...digits.slice(from + 1),
  ]
  console.log(outDigits)

  return [+outDigits.join(''), from, to]
}

// cspell:disable
export function isTriangle(a: number, b: number, c: number): boolean {
  const sum = a + b + c
  return sum - 2 * Math.max(a, b, c) > 0
}

// in-source test suites
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest

  describe('Sample Test Cases', function () {
    it('Should return a string', function () {
      assert.equal(
        removeDuplicateWords(
          'alpha beta beta gamma gamma gamma delta alpha beta beta gamma gamma gamma delta'
        ),
        'alpha beta gamma delta'
      )
    })
  })

  describe('Other Tests', function () {
    it('Static Ones', function () {
      assert.equal(sortMyString('CodeWars'), 'CdWr oeas')
      assert.equal(sortMyString("YCOLUE'VREER"), "YOU'RE CLEVER")
    })
  })

  function testing(a1: number[] | null, a2: number[] | null, expected: boolean) {
    var s1 = ''
    var s2 = ''
    if (a1 !== null) s1 = a1.toString()
    else s1 = 'null'
    if (a2 !== null) s2 = a2.toString()
    else s2 = 'null'
    assert.strictEqual(comp(a1, a2), expected, 'Error with [' + s1 + '] / [' + s2 + ']\n')
  }

  describe('Fixed Tests comp', function () {
    it('Basic tests', function () {
      var a1: number[] = [121, 144, 19, 161, 19, 144, 19, 11]
      var a2: number[] = [
        11 * 11,
        121 * 121,
        144 * 144,
        19 * 19,
        161 * 161,
        19 * 19,
        144 * 144,
        19 * 19,
      ]
      testing(a1, a2, true)

      a1 = [121, 144, 19, 161, 19, 144, 19, 11]
      a2 = [11 * 21, 121 * 121, 144 * 144, 19 * 19, 161 * 161, 19 * 19, 144 * 144, 19 * 19]
      testing(a1, a2, false)
    })
  })

  describe('Fixed Tests smallest', function () {
    it('Basic tests', function () {
      assert.deepEqual(smallest(261235), [126235, 2, 0])
      assert.deepEqual(smallest(209917), [29917, 0, 1])
      assert.deepEqual(smallest(285365), [238565, 3, 1])
      assert.deepEqual(smallest(269045), [26945, 3, 0])
      assert.deepEqual(smallest(296837), [239687, 4, 1])
    })
  })
}
// cspell:enable
