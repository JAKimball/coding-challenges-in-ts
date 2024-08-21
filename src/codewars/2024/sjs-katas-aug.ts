import { performance } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

/***************************
 * Friend or Foe?
 */

export const friend = (friends: string[]) => friends.filter(v => v.length === 4)

// in-source test suites
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('Basic tests', () => {
    it('Testing for fixed tests', () => {
      assert.deepEqual(friend(['Ryan', 'Kieran', 'Mark']), ['Ryan', 'Mark'])
      assert.deepEqual(friend(['Ryan', 'Jimmy', '123', '4', 'Cool Man']), ['Ryan'])
      assert.deepEqual(friend(['Jimm', 'Cari', 'aret', 'truehdnviegkwgvke', 'sixtyiscooooool']), [
        'Jimm',
        'Cari',
        'aret',
      ])
      assert.deepEqual(friend(['Love', 'Your', 'Face', '1']), ['Love', 'Your', 'Face'])
      assert.deepEqual(friend(['Hell', 'Is', 'a', 'badd', 'word']), ['Hell', 'badd', 'word'])
      assert.deepEqual(friend(['Issa', 'Issac', 'Issacs', 'ISISS']), ['Issa'])
      assert.deepEqual(friend(['Robot', 'Your', 'MOMOMOMO']), ['Your'])
      assert.deepEqual(friend(['Hello', 'I', 'AM', 'Sanjay', 'Gupt']), ['Gupt'])
      assert.deepEqual(friend(['This', 'IS', 'enough', 'TEst', 'CaSe']), ['This', 'TEst', 'CaSe'])
      assert.deepEqual(friend([]), [])
    })
  })
}

/****
 * Round 2
 */

/****
 * Categorize New Member
 * https://www.codewars.com/kata/5502c9e7b3216ec63c0001aa/train/javascript
 */

enum Category {
  Senior = 'Senior',
  Open = 'Open',
}

export const openOrSenior = (data: number[][]) =>
  data.map(([age, handicap]) => (age >= 55 && handicap > 7 ? Category.Senior : Category.Open))

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('Basic tests', () => {
    it('Fixed tests', () => {
      assert.deepEqual(
        openOrSenior([
          [45, 12],
          [55, 21],
          [19, -2],
          [104, 20],
        ]),
        ['Open', 'Senior', 'Open', 'Senior']
      )
      assert.deepEqual(
        openOrSenior([
          [3, 12],
          [55, 1],
          [91, -2],
          [53, 23],
        ]),
        ['Open', 'Open', 'Open', 'Open']
      )
      assert.deepEqual(
        openOrSenior([
          [59, 12],
          [55, -1],
          [12, -2],
          [12, 12],
        ]),
        ['Senior', 'Open', 'Open', 'Open']
      )
    })
  })
}

/****
 * https://www.codewars.com/kata/55c45be3b2079eccff00010f/train/javascript
 * Round 2
 */

export const order = (words: string) => {
  const result = []
  const inWords: string[] = words.split(' ')
  const matches = words.matchAll(/\d/g)

  let i = 0
  for (const match of matches) {
    result[Number(match[0]) - 1] = inWords[i]
    i++
  }

  return result.join(' ')
}

// order("is2 Thi1s T4est 3a")

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('solution', function () {
    it('basicTests', function () {
      assert.equal(order('is2 Thi1s T4est 3a'), 'Thi1s is2 3a T4est')
      assert.equal(order('4of Fo1r pe6ople g3ood th5e the2'), 'Fo1r the2 g3ood 4of th5e pe6ople')
      assert.equal(order(''), '')
    })
  })
}

/****
 * https://www.codewars.com/kata/61fef3a2d8fa98021d38c4e5/train/javascript
 * Round 2
 */
