// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { assert, describe, expect, it } from 'vitest'
import { ackermann, ackermann_m } from './ackermann.js'

const ackermannExpectedResults = [
  [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n],
  [2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n],
  [3n, 5n, 7n, 9n, 11n, 13n, 15n, 17n, 19n, 21n],
  [5n, 13n, 29n, 61n, 125n, 253n, 509n, 1021n, 2045n, 4093n],
  [13n],
]

describe('ackermann function:', () => {
  ackermannExpectedResults.forEach((row, m) => {
    row.forEach((expected, n) => {
      it(`ackermann(${m}, ${n}) === ${expected}`, () => {
        expect(ackermann(m, BigInt(n))).toBe(expected)
      })
    })
  })

  // The following is too slow to include in the test suite without optimization
  // it('ackermann(4, 1) === 65533', () => {
  //   expect(ackermann(4, 1n)).toBe(65533n)
  // })

  // The following consistently exceed the maximum call stack size
  // it('ackermann(4, 2) === 4294967293', () => {
  //   expect(ackermann(4, 2n)).toBe(4294967293n)
  // })
  // it('ackermann(4, 3) === 281474976710653', () => {
  //   expect(ackermann(4, 3n)).toBe(281474976710653n)
  // })
})

describe('ackermann_m function:', () => {
  ackermannExpectedResults.forEach((row, m) => {
    row.forEach((expected, n) => {
      it(`ackermann_m(${m}, ${n}) === ${expected}`, () => {
        expect(ackermann_m(m, BigInt(n))).toBe(expected)
      })
    })
  })

  // The following sometimes fails due to a stack overflow
  // it('ackermann_m(4, 1) === 65533', () => {
  //   expect(ackermann_m(4, 1n)).toBe(65533n)
  // })

  // The following consistently exceed the maximum call stack size
  // it('ackermann_m(4, 2) === 4294967293', () => {
  //   expect(ackermann_m(4, 2n)).toBe(4294967293n)
  // })
  // it('ackermann_m(4, 3) === 281474976710653', () => {
  //   expect(ackermann_m(4, 3n)).toBe(281474976710653n)
  // })
})
