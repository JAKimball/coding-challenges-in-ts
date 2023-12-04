// Seattle JS - Code Katas - November 2023

import { performance } from 'perf_hooks'

import { memoize } from '../dp/memoize.js'

export class Kata {
  static disemvowel(str: string): string {
    let result = ''
    for (const c of str) {
      if (!'aeiouAEIOU'.includes(c)) result += c
    }

    return result
  }

  static disemvowel2(str: string): string {
    return str.replace(/[aeiou]/gi, '')
  }
}

// in-source test suites
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest

  describe('disemvowel', function () {
    it('should pass a sample test', function () {
      assert.strictEqual(
        Kata.disemvowel('This website is for losers LOL!'),
        'Ths wbst s fr lsrs LL!'
      )
    })
  })

  describe('disemvowel2', function () {
    it('should pass a sample test', function () {
      assert.strictEqual(
        Kata.disemvowel2('This website is for losers LOL!'),
        'Ths wbst s fr lsrs LL!'
      )
    })
  })
}

type AnyFn = (...args: unknown[]) => unknown
type TimedFn<T extends AnyFn> = (...args: Parameters<T>) => ReturnType<T>

function timeFn<T extends AnyFn>(
  iterations: number,
  fns: TimedFn<T>[],
  ...args: Parameters<T>
): [TimedFn<T>, number][] {
  const results = fns.map(fn => {
    let totalTime = 0
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now()
      fn(...args)
      const endTime = performance.now()
      totalTime += endTime - startTime
    }

    return [fn, totalTime / iterations] as [TimedFn<T>, number]
  })

  return results
}

// Warm up V8 optimization
for (let i = 0; i < 1000; i++) {
  Kata.disemvowel('This website is for losers LOL!')
  Kata.disemvowel2('This website is for losers LOL!')
}

timeFn(
  1000,
  [Kata.disemvowel.bind(Kata) as AnyFn, Kata.disemvowel2.bind(Kata) as AnyFn],
  'This website is for losers LOL!'
) // ?

export class Kata2 {
  static getCount(str: string): number {
    return [...str.matchAll(/[aeiou]/gi)].length
  }
}

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest

  describe('getCount', function () {
    it('should pass a sample test', function () {
      assert.strictEqual(Kata2.getCount('abracadabra'), 5)
    })
  })
}

export function countBits(n: number): number {
  let result = 0
  while (n) {
    if (n % 2) result += 1
    n = Math.floor(n / 2)
  }

  return result
}

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest

  describe('example', function () {
    it('test', function () {
      assert.equal(countBits(0), 0)
      assert.equal(countBits(4), 1)
      assert.equal(countBits(7), 3)
      assert.equal(countBits(9), 2)
      assert.equal(countBits(10), 2)
    })
  })
}
