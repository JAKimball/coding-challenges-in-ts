// ============ April 18th, 2023 ============= //

// ============================
// Sum of a sequence
// https://www.codewars.com/kata/586f6741c66d18c22800010a/train/typescript
// https://www.codewars.com/kata/586f6741c66d18c22800010a
// ============================

export const sequenceSum = (begin: number, end: number, step: number): number => {
  let result = 0
  for (let i = begin; i <= end; i += step) {
    result += i
  }

  return result
}

// In-source tests
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest
  describe('sequenceSum tests', () => {
    it('should pass basic tests', () => {
      expect(sequenceSum(2, 6, 2)).toBe(12)
      expect(sequenceSum(1, 5, 1)).toBe(15)
      expect(sequenceSum(1, 5, 3)).toBe(5)
      expect(sequenceSum(0, 15, 3)).toBe(45)
      expect(sequenceSum(16, 15, 3)).toBe(0)
      expect(sequenceSum(2, 24, 22)).toBe(26)
      expect(sequenceSum(2, 2, 2)).toBe(2)
      expect(sequenceSum(2, 2, 1)).toBe(2)
      expect(sequenceSum(1, 15, 3)).toBe(35)
      expect(sequenceSum(15, 1, 3)).toBe(0)
    })
  })
}

// ============================
// Cats and shelves
// https://www.codewars.com/kata/62c93765cef6f10030dfa92b/train/typescript/643f4cf1ef8153214538a393
// ============================

export const solution = (start: number, finish: number) => {
  const distance = finish - start
  return Math.floor(distance / 3) + (distance % 3)
}

// In-source tests
if (import.meta.vitest) {
  const { assert, describe, it } = import.meta.vitest
  describe('Mew tests', function () {
    it('Start 1, finish 5', () => {
      assert.strictEqual(solution(1, 5), 2)
    })
    it('Start 3, finish 3', () => {
      assert.strictEqual(solution(3, 3), 0)
    })
    it('Start 2, finish 4', () => {
      assert.strictEqual(solution(2, 4), 2)
    })
  })
}

// ============================
// Find the unique number
// https://www.codewars.com/kata/585d7d5adb20cf33cb000235/train/typescript
// ============================

export function findUniq(arr: number[]): number {
  const map = new Map()
  arr.forEach(el => {
    if (map.has(el)) {
      map.set(el, map.get(el) + 1)
    } else map.set(el, 1)
  })
  for (const el of arr) {
    if (map.get(el) === 1) {
      return el
    }
  }

  return 0
}

// In-source tests
if (import.meta.vitest) {
  const { assert, describe, it } = import.meta.vitest
  describe('findUniq tests', () => {
    it('should pass basic tests', () => {
      assert.strictEqual(findUniq([0, 1, 0]), 1)
      assert.strictEqual(findUniq([1, 1, 1, 2, 1, 1]), 2)
      assert.strictEqual(findUniq([3, 10, 3, 3, 3]), 10)
    })
  })
}

// ============ June 20th, 2023 ============= //

// ============================
// ⚠️Fusion Chamber Shutdown⚠️
// https://www.codewars.com/kata/5fde1ea66ba4060008ea5bd9/train/typescript
// ============================

function burner(c: number, h: number, o: number) {
  const water = Math.min(Math.floor(h / 2), o)
  h -= water * 2
  o -= water

  const co2 = Math.min(Math.floor(o / 2), c)
  o -= co2 * 2
  c -= co2

  const methane = Math.min(Math.floor(h / 4), c)

  return [water, co2, methane]
}

// In-source tests
if (import.meta.vitest) {
  const { assert, describe, it } = import.meta.vitest
  describe('burner tests', () => {
    it('should pass basic tests', () => {
      assert.deepStrictEqual(burner(45, 11, 100), [5, 45, 0])
      assert.deepStrictEqual(burner(354, 1023230, 0), [0, 0, 354])
      assert.deepStrictEqual(burner(939, 3, 694), [1, 346, 0])
      assert.deepStrictEqual(burner(215, 41, 82100), [20, 215, 0])
      assert.deepStrictEqual(burner(113, 0, 52), [0, 26, 0])
    })
  })
}

// ============================
// Correct the time-string
// https://www.codewars.com/kata/57873ab5e55533a2890000c7/train/typescript
// ============================

export function timeCorrect(timeString: null | string): null | string {
  if (timeString === null) {
    return null
  }

  if (timeString === '') {
    return ''
  }

  if (timeString.length !== 8) {
    return null
  }

  if (timeString[2] !== ':' || timeString[5] !== ':') {
    return null
  }

  let [h, m, s] = timeString.split(':').map(s => Number(s))
  if (isNaN(h) || isNaN(m) || isNaN(s)) {
    return null
  }

  let carry = Math.floor(s / 60)
  s = s % 60
  m += carry

  carry = Math.floor(m / 60)
  m = m % 60
  h += carry

  h = h % 24

  return (
    h.toString().padStart(2, '0') +
    ':' +
    m.toString().padStart(2, '0') +
    ':' +
    s.toString().padStart(2, '0')
  )
}

// In-source tests
if (import.meta.vitest) {
  const { assert, describe, it } = import.meta.vitest
  describe('timeCorrect tests', () => {
    it('should pass basic tests', () => {
      // Null or Empty
      assert.equal(timeCorrect(null), null)
      assert.equal(timeCorrect(''), '')

      // Invalid Format
      assert.equal(timeCorrect('001122'), null)
      assert.equal(timeCorrect('00;11;22'), null)
      assert.equal(timeCorrect('0a:1c:22'), null)

      // Correction Tests
      assert.equal(timeCorrect('09:10:01'), '09:10:01')
      assert.equal(timeCorrect('11:70:10'), '12:10:10')
      assert.equal(timeCorrect('19:99:09'), '20:39:09')
      assert.equal(timeCorrect('19:99:99'), '20:40:39')
      assert.equal(timeCorrect('24:01:01'), '00:01:01')
      assert.equal(timeCorrect('52:01:01'), '04:01:01')
    })
  })
}

const timeString = '10:22:33'
timeString[2] //?

// convert number to string with leading zeros
const num = 5
num.toString().padStart(2, '0') //?
