// ============================
// Array plus array
// https://www.codewars.com/kata/5a2be17aee1aaefe2a000151/train/typescript
// ============================

export const arrayPlusArray = (arr1: number[], arr2: number[]) =>
  arr1.reduce((a, el) => a + el) + arr2.reduce((a, el) => a + el)

// In-source tests
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest
  describe('arrayPlusArray tests', () => {
    it('should pass basic tests', () => {
      expect(arrayPlusArray([1, 2, 3], [4, 5, 6])).toBe(21)
      expect(arrayPlusArray([-1, -2, -3], [-4, -5, -6])).toBe(-21)
      expect(arrayPlusArray([0, 0, 0], [4, 5, 6])).toBe(15)
      expect(arrayPlusArray([100, 200, 300], [400, 500, 600])).toBe(2100)
    })
  })
}

// ============================
// Nth Smallest Element (Array Series #4)
// https://www.codewars.com/kata/5a512f6a80eba857280000fc/train/typescript
// ============================

export const nthSmallest = (arr: number[], pos: number) =>
  Array.from(arr).sort((a, b) => a - b)[pos - 1]

// In-source tests
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest
  describe('nthSmallest tests', () => {
    it('should pass basic tests', () => {
      expect(nthSmallest([3, 1, 2], 2)).toBe(2)
      expect(nthSmallest([15, 20, 7, 10, 4, 3], 3)).toBe(7)
      expect(nthSmallest([-5, -1, -6, -18], 4)).toBe(-1)
      expect(nthSmallest([-102, -16, -1, -2, -367, -9], 5)).toBe(-2)
      expect(nthSmallest([2, 169, 13, -5, 0, -1], 4)).toBe(2)
      expect(nthSmallest([177, 225, 243, -169, -12, -5, 2, 92], 5)).toBe(92)
      expect(nthSmallest([78, 117, 5, 33, 88, 13, 92, 86, 30, 58], 5)).toBe(58)
      expect(nthSmallest([-64, -25, -16, -53, 57, 67, 36, -91, 55, -5], 1)).toBe(-91)
      expect(nthSmallest([78, 33, 22, 44, 88, 9, 6, 66, 11], 2)).toBe(9)
    })
  })
}

// ============================
// Product Of Maximums Of Array (Array Series #2)
// https://www.codewars.com/kata/5a63948acadebff56f000018/train/typescript
// ============================

export const maxProduct = (numbers: number[], size: number) => {
  const sorted = [...numbers].sort((a, b) => b - a)
  let result = 1
  for (let i = 0; i < size; i++) {
    result *= sorted[i]
  }

  return result
}

// In-source tests
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest
  describe('maxProduct tests', () => {
    it('should pass basic tests', () => {
      expect(maxProduct([4, 3, 5], 2)).toBe(20)
      expect(maxProduct([10, 8, 7, 9], 3)).toBe(720)
      expect(maxProduct([8, 6, 4, 6], 3)).toBe(288)
      expect(maxProduct([10, 2, 3, 8, 1, 10, 4], 5)).toBe(9600)
      expect(maxProduct([13, 12, -27, -302, 25, 37, 133, 155, -14], 5)).toBe(247895375)
      expect(maxProduct([-4, -27, -15, -6, -1], 2)).toBe(4)
      expect(maxProduct([-17, -8, -102, -309], 2)).toBe(136)
    })
  })
}

// ============================
// Array.diff
// https://www.codewars.com/kata/523f5d21c841566fde000009/train/typescript
// ============================

export const arrayDiff = (a: number[], b: number[]) => {
  const set = new Set(b)
  return a.filter(item => !set.has(item))
}

arrayDiff([], [4, 5]) //?
arrayDiff([3, 4], [3]) //?
arrayDiff([1, 8, 2], []) //?
arrayDiff([1, 2, 3], [1, 2]) //?

// In-source tests
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest
  describe('arrayDiff tests', () => {
    it('should pass basic tests', () => {
      expect(arrayDiff([], [4, 5])).toStrictEqual([])
      expect(arrayDiff([3, 4], [3])).toStrictEqual([4])
      expect(arrayDiff([1, 8, 2], [])).toStrictEqual([1, 8, 2])
      expect(arrayDiff([1, 2, 3], [1, 2])).toStrictEqual([3])
      expect(arrayDiff([1, 2, 2, 2, 3], [2])).toStrictEqual([1, 3])
    })
  })
}

// ============================
// Maximum subarray sum
// https://www.codewars.com/kata/maximum-subarray-sum/train/javascript
// ============================

export const maxSequence = (arr: number[]): number => {
  let maxSum = 0
  for (let i = 0; i < arr.length; i++) {
    let sum = 0
    for (let j = i; j < arr.length; j++) {
      sum += arr[j]
      if (sum > maxSum) {
        maxSum = sum
      }
    }
  }

  return maxSum
}

// In-source tests
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest
  describe('maxSequence tests', () => {
    it('should pass basic tests', () => {
      expect(maxSequence([])).toBe(0)
      expect(maxSequence([-2, 1, -3, 4, -1, 2, 1, -5, 4])).toBe(6)
      expect(maxSequence([-2, -1, -3, -4, -1, -2, -1, -5, -4])).toBe(0)
      expect(maxSequence([-2, 1, -7, 4, -10, 2, 1, 5, 4])).toBe(12)
    })
  })
}

// ============================
// Path: src/codewars/katas-july.ts
// Compare this snippet from src/codewars/rowWeights.ts:
// function rowWeights(array: number[]) {
//   return [
//     array.reduce((acc, cur, i) => (i % 2 ? acc : acc + cur), 0),
//     array.reduce((acc, cur, i) => (i % 2 ? acc + cur : acc), 0),
//   ]
// }
//
