import { performance } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

export function getSectionId(scroll: number, sizes: number[]) {
  let currentEnd = -1

  for (let index = 0; index <= sizes.length; index++) {
    currentEnd += sizes[index]
    if (currentEnd >= scroll) return index
  }

  return -1
}

export function getSectionId2(scroll: number, sizes: number[]) {
  let currentEnd = -1
  let index = 0
  while (index <= sizes.length) {
    currentEnd += sizes[index]
    if (currentEnd >= scroll) return index
    index++
  }

  return -1
}

// in-source test suites
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  const testing = (n: number, a: number[], exp: number) => {
    it(`getSectionId(${n}, [${a.join(', ')}])`, () => {
      assert.strictEqual(getSectionId(n, a), exp)
    })
  }

  describe('Basic tests', function () {
    testing(1, [300, 200, 400, 600, 100], 0)
    testing(299, [300, 200, 400, 600, 100], 0)
    testing(300, [300, 200, 400, 600, 100], 1)
    testing(1599, [300, 200, 400, 600, 100], 4)
    testing(1600, [300, 200, 400, 600, 100], -1)
  })
}

// Sum of Cubes
export function sumCubes(n: number): number {
  let result = 1
  for (let i = 2; i <= n; i++) {
    result += i ** 3
  }

  return result
}

// Test
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('Fixed tests', () => {
    it('Testing for 1', () => {
      assert.strictEqual(sumCubes(1), 1)
    })
    it('Testing for 2', () => {
      assert.strictEqual(sumCubes(2), 9)
    })
    it('Testing for 3', () => {
      assert.strictEqual(sumCubes(3), 36)
    })
    it('Testing for 4', () => {
      assert.strictEqual(sumCubes(4), 100)
    })
    it('Testing for 10', () => {
      assert.strictEqual(sumCubes(10), 3025)
    })
    it('Testing for 123', () => {
      assert.strictEqual(sumCubes(123), 58155876)
    })
  })
}

// Sort the columns of a csv-file
export function sortCsvColumns(csvFileContent: string): string {
  const rows: string[] = csvFileContent.split(';')
  const titles: string[] = rows[0].split(';')

  const TitleIndex = Array.from(titles.entries()).sort((a, b) => a[1].localeCompare(b[1]))

  let result: string[] = []
  result[0] = TitleIndex.map(v => v[0]).join(';')
  // TODO: continue here
  // for (i = )

  return result
}

// test
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('KataTest', function () {
    it('BasicTests', function () {
      let preSorting =
        'myjinxin2015;raulbc777;smile67;Dentzil;SteffenVogel_79\n' +
        '17945;10091;10088;3907;10132\n' +
        '2;12;13;48;11'
      let postSorting =
        'Dentzil;myjinxin2015;raulbc777;smile67;SteffenVogel_79\n' +
        '3907;17945;10091;10088;10132\n' +
        '48;2;12;13;11'
      assert.strictEqual(sortCsvColumns(preSorting), postSorting)

      preSorting =
        'IronMan;Thor;Captain America;Hulk\n' +
        'arrogant;divine;honorably;angry\n' +
        'armor;hammer;shield;greenhorn\n' +
        'Tony;Thor;Steven;Bruce'
      postSorting =
        'Captain America;Hulk;IronMan;Thor\n' +
        'honorably;angry;arrogant;divine\n' +
        'shield;greenhorn;armor;hammer\n' +
        'Steven;Bruce;Tony;Thor'
      assert.strictEqual(sortCsvColumns(preSorting), postSorting)
    })
  })
}
