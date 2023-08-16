export function isTriangle(a: number, b: number, c: number): boolean {
  const sum = a + b + c
  return sum - 2 * Math.max(a, b, c) > 0
}

// Inline tests with vitest

// Test isTriangle

// describe('PublicTest', function () {
//   it('should pass basic tests', () => {
//     assert.strictEqual(isTriangle(1, 2, 2), true)
//     assert.strictEqual(isTriangle(7, 2, 2), false)
//   })
// })

isTriangle(1, 2, 2) //?
isTriangle(7, 2, 2) //?
isTriangle(1, 2, 3) //?
isTriangle(1, 3, 2) //?
isTriangle(3, 1, 2) //?
isTriangle(5, 1, 2) //?
isTriangle(1, 2, 5) //?
isTriangle(2, 5, 1) //?

// radix sort?

export function triangular(n: number): number {
  if (n < 0) {
    return 0
  }

  return ((n + 1) * n) / 2
}

triangular(0) //?
triangular(2) //?
triangular(3) //?
triangular(-10) //?
triangular(-9) //?
triangular(5) //?
triangular(9) //?
triangular(10) //?
triangular(100) //?
triangular(-454) //?

export function triangular2(n: number): number {
  return ((n + 1) * n) / 2
}

triangular2(0) //?
triangular2(2) //?
