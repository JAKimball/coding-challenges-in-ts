// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { assert, describe, expect, it } from 'vitest'
import {
  fib,
  numWays,
  hailstone,
  hailstone2,
  gridTraveler,
  decodeStr,
  encodeStr,
  node,
  missing,
} from './fib.js'
// import * as fib from "./js"

describe('fib function:', () => {
  it('the ratio of fib(n+1)/fib(n) should approach ϕ for higher values of n', () => {
    const ϕ = (1 + Math.sqrt(5)) / 2
    expect(Number(fib(41)) / Number(fib(40))).toBe(ϕ)
  })
})

describe('hailstone functions:', () => {
  it('hailstone(7) = 17', () => {
    expect(hailstone(7)).toBe(17)
  })
  it('hailstone2(n) === hailstone(n)', () => {
    for (let i = 1; i <= 100; i++) expect(hailstone2(i)).toBe(hailstone(i))
    console.table(
      [...hailstone.map.values()],
      ['result', 'hitCount', 'stackHeight', 'maxStackHeight', 'branchSize']
    )

    console.table(
      [...hailstone2.map.values()],
      ['result', 'hitCount', 'stackHeight', 'maxStackHeight', 'branchSize']
    )
  })
})

describe('gridTraveler function:', () => {
  it('gridTraveler(1, 1) === 1', () => {
    expect(gridTraveler(1, 1)).toBe(1)
  })
  it('gridTraveler(2, 3) === 3', () => {
    expect(gridTraveler(2, 3)).toBe(3)
  })
  it('gridTraveler(3, 2) === 3', () => {
    expect(gridTraveler(3, 2)).toBe(3)
  })
  it('gridTraveler(3, 3) === 6', () => {
    expect(gridTraveler(3, 3)).toBe(6)
  })
  it('gridTraveler(18, 18) === 2333606220', () => {
    expect(gridTraveler(18, 18)).toBe(2333606220)
  })
})

describe('numWays function:', () => {
  it('numWays(0, [1, 2]) === 1', () => {
    expect(numWays(0, [1, 2])).toBe(1)
  })
  it('numWays(1, [1, 2]) === 1', () => {
    expect(numWays(1, [1, 2])).toBe(1)
  })
  it('numWays(2, [1, 2]) === 2', () => {
    expect(numWays(2, [1, 2])).toBe(2)
  })
  it('numWays(3, [1, 2]) === 3', () => {
    expect(numWays(3, [1, 2])).toBe(3)
  })
  it('numWays(4, [1, 2]) === 5', () => {
    expect(numWays(4, [1, 2])).toBe(5)
  })
  it('numWays(5, [1, 2]) === 8', () => {
    expect(numWays(5, [1, 2])).toBe(8)
  })
  it('numWays(6, [1, 2]) === 13', () => {
    expect(numWays(6, [1, 2])).toBe(13)
  })
  it('numWays(7, [1, 2]) === 21', () => {
    expect(numWays(7, [1, 2])).toBe(21)
  })
  it('numWays(4, [1, 3, 5]) === 3', () => {
    expect(numWays(4, [1, 3, 5])).toBe(3)
  })
  it('numWays(5, [1, 3, 5]) === 5', () => {
    expect(numWays(5, [1, 3, 5])).toBe(5)
  })
  it('numWays(6, [1, 3, 5]) === 8', () => {
    expect(numWays(6, [1, 3, 5])).toBe(8)
  })
  it('numWays(7, [1, 3, 5]) === 12', () => {
    expect(numWays(7, [1, 3, 5])).toBe(12)
  })
  it('numWays(8, [1, 3, 5]) === 19', () => {
    expect(numWays(8, [1, 3, 5])).toBe(19)
  })
})

describe('decodeStr function:', () => {
  it('test case "a2z2r4"', () => {
    expect(decodeStr('a2z2r4')).toBe('aaazzzrrrrr')
  })
  it('test case 2', () => {
    expect(decodeStr('')).toBe('')
  })
  it('test case 3', () => {
    expect(decodeStr('abc0hij1klm11')).toBe('abchijjklmmmmmmmmmmmm')
  })
  it('test case 4', () => {
    expect(decodeStr('abc0hij1klm11r')).toBe('abchijjklmmmmmmmmmmmmr')
  })
})

describe('encodeStr function:', () => {
  it('test case "aaazzzrrrrr"', () => {
    expect(encodeStr('aaazzzrrrrr')).toBe('a2z2r4')
  })
  it('test case 2', () => {
    expect(encodeStr('')).toBe('')
  })
  it('test case 3', () => {
    expect(encodeStr('abchijjklmmmmmmmmmmmm')).toBe('abchij1klm11')
  })
  it('test case 4', () => {
    expect(encodeStr('abchijjklmmmmmmmmmmmmr')).toBe('abchij1klm11r')
  })
})

describe('Boundary method', () => {
  it('gives expected result', () => {
    expect(node.boundary()).toStrictEqual([
      'a',
      'b',
      'd',
      'h',
      'i',
      'j',
      'k',
      'f',
      'n',
      'o',
      'g',
      'c',
    ])
  })
})

describe('"missing" function', () => {
  it('should identify the missing integer given an arbitrary consecutive range with one integer missing', () => {
    expect(missing([4, 5, 7, 8])).toEqual(6)
    expect(missing([4, 5, 7, 8, 9])).toEqual(6)
    expect(missing([4, 5, 6, 7, 8, 9])).toEqual(0)
    expect(missing([4, 6, 7, 8, 9])).toEqual(5)
    expect(missing([9, 7, 6, 5, 4])).toEqual(8)
    expect(missing([4, 7, 8, 9])).toEqual(11)
    expect(missing([0, 2, 3, 4])).toEqual(1)
    expect(missing([-1, 1, 2])).toEqual(0)
    expect(missing([-3, -1, 1])).toEqual(-2)
    expect(missing([-3, -1, 0, 1, 3])).toEqual(0)
  })
})

import { digitCount } from './fib.js'
describe('digitCount(n)', () => {
  it('should return the number of digits in the given integer', () => {
    expect(digitCount(1)).toEqual(1)
    expect(digitCount(9)).toEqual(1)
    expect(digitCount(10)).toEqual(2)
    expect(digitCount(99)).toEqual(2)
    expect(digitCount(100)).toEqual(3)
    expect(digitCount(999)).toEqual(3)
    expect(digitCount(10000)).toEqual(5)
    expect(digitCount(99999)).toEqual(5)
    expect(digitCount(10000000000000)).toEqual(14)
    expect(digitCount(99999999999999)).toEqual(14)
    expect(digitCount(-1)).toEqual(1)
    expect(digitCount(0)).toEqual(1)
  })
})
