export function isTriangle(a: number, b: number, c: number): boolean {
  const sum = a + b + c
  return sum - 2 * Math.max(a, b, c) > 0
}

// in-source test
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest
  describe('isTriangle tests', () => {
    it('should pass basic tests', () => {
      expect(isTriangle(1, 2, 2)).toBe(true)
      expect(isTriangle(7, 2, 2)).toBe(false)
      expect(isTriangle(1, 2, 3)).toBe(false)
    })
  })
}

export function triangular(n: number): number {
  if (n < 0) {
    return 0
  }

  return ((n + 1) * n) / 2
}

// in-source test
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest
  describe('triangular tests', () => {
    it('should pass basic tests', () => {
      expect(triangular(0)).toBe(0)
      expect(triangular(2)).toBe(3)
      expect(triangular(3)).toBe(6)
      expect(triangular(-10)).toBe(0)
      expect(triangular(-9)).toBe(0)
      expect(triangular(5)).toBe(15)
      expect(triangular(9)).toBe(45)
      expect(triangular(10)).toBe(55)
      expect(triangular(100)).toBe(5050)
      expect(triangular(-454)).toBe(0)
    })
  })
}

// radix sort?
