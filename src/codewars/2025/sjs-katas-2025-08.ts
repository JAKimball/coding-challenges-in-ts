import { performance, PerformanceObserver } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

const fib1 = (n: number) => {
  let [a, b] = [0, 1]
  while (n-- > 0) [a, b] = [b, a + b]
  return a
}

const fib2 = (n: number) => {
  let [a, b] = [0, 1]
  while (n-- > 0) {
    b += a
    a = b - a
  }
  return a
}

// Memoized Fibonacci function
const _MAP_SIZE = 99 // Inaccurate for n > 78 due to JS number precision limits
const _FIB_MAP: number[] = new Array(_MAP_SIZE).fill(0)
;(() => {
  let [a, b] = [0, 1],
    n = 0
  while (n < _MAP_SIZE) {
    _FIB_MAP[n++] = a
    ;[a, b] = [b, a + b]
  }
})()

const fib_memoByArray = (n: number) => _FIB_MAP[n]

const fibBigInt = (n: number) => {
  let [a, b] = [0n, 1n]
  for (let i = 0; i < n; i++) {
    ;[a, b] = [b, a + b]
  }
  return a
}

const fibBigInt2 = (n: number) => {
  let [a, b] = [0n, 1n]
  while (n-- > 0) [a, b] = [b, a + b]
  return a
}

// Calculate the golden ratio - ϕ (Phi)
const ϕ = (1 + Math.sqrt(5)) / 2
// Conjugate of the golden ratio - ψ (Psi)
const ψ = (1 - Math.sqrt(5)) / 2

const sqrt5 = Math.sqrt(5)
// Binet's formula (closed-form expression for Fibonacci numbers)
const closedFib = (n: number) => (ϕ ** n - ψ ** n) / sqrt5
// Despite appearance, this function is not O(1)!
// BigO for computing the power functions (ϕ ** n and ψ ** n)
// is O(log n) because of exponentiation by squaring.
// Fortunately, if we only need to compute terms of the sequence
// rather than the proper closed form, the contribution of the
// ϕ ** n term is small enough so that the error is less than 0.5
// for n >= 0, allowing us to round the result of the cheaper form.
const cheapFib = (n: number) => ϕ ** n / sqrt5
const quickFib = (n: number) => Math.round(ϕ ** n / sqrt5)

// Because the squaring and dividing are still more expensive to compute
// than addition, quickFib() is still much slower than
// fib1() above for small n, even though fib1() has a BigO of O(n).
// The crossover point with Node.JS running on my hardware seems to be
// around n = 50.

// We may get slightly higher performance (or lower power usage)
// by multiplying with a 1 / sqrt(5) constant rather than dividing
// as generally multiplication is cheaper than division.  Test and find out!
const sqrt5R = 1 / sqrt5
const closedFibR = (n: number) => (ϕ ** n - ψ ** n) * sqrt5R
const cheapFibR = (n: number) => ϕ ** n * sqrt5R
const quickFibR = (n: number) => Math.round(ϕ ** n * sqrt5R)

// Select our fastest Fibonacci function
let fib = fib_memoByArray

const LN_PHI = Math.log(ϕ)
export const productFib = (prod: number): [number, number, boolean] => {
  let real_n = Math.log(prod * 5) / LN_PHI
  let n1 = Math.round((real_n - 1) / 2)
  let n2 = n1 + 1
  let [a, b] = [fib(n1), fib(n2)]
  ;[a, b] = prod > a * b ? [b, a + b] : [a, b]
  return [a, b, a * b === prod]
}

const LN2_PHI = Math.log2(ϕ)
export const productFib_LN2 = (prod: number): [number, number, boolean] => {
  let real_n = Math.log2(prod * 5) / LN2_PHI
  let n1 = Math.round((real_n - 1) / 2)
  let n2 = n1 + 1
  let [a, b] = [fib(n1), fib(n2)]
  ;[a, b] = prod > a * b ? [b, a + b] : [a, b]
  return [a, b, a * b === prod]
}

const LN10_PHI = Math.log10(ϕ)
export const productFib_LN10 = (prod: number): [number, number, boolean] => {
  let real_n = Math.log10(prod * 5) / LN10_PHI
  let n1 = Math.round((real_n - 1) / 2)
  let n2 = n1 + 1
  let [a, b] = [fib(n1), fib(n2)]
  ;[a, b] = prod > a * b ? [b, a + b] : [a, b]
  return [a, b, a * b === prod]
}

export const productFib2 = (prod: number): [number, number, boolean] => {
  let n = 0
  while (fib(n) * fib(++n) < prod) {}

  const f1 = fib(n - 1)
  const f2 = fib(n)

  return [f1, f2, f1 * f2 === prod]
}

export const productFib3 = (prod: number): [number, number, boolean] => {
  let [a, b] = [0, 1]
  while (a * b < prod) [a, b] = [b, a + b]
  return [a, b, a * b === prod]
}

export const productFib_theRemix = (product: number): [number, number, boolean] => {
  const seq = [0, 1]

  while (seq[0] * seq[1] < product) {
    ;[seq[0], seq[1]] = [seq[1], seq[0] + seq[1]]
  }

  return [...seq, seq[0] * seq[1] === product] as [number, number, boolean]
}

function productFib_AdrianB(prod: number): [number, number, boolean] {
  // Calculate Fibonacci terms and find smallest two values that are >= product, ideally equal
  let firstTerm = 0
  let secondTerm = 1
  while (firstTerm * secondTerm < prod) {
    let nextTerm = firstTerm + secondTerm // Calculate next term in Fibonacci sequence
    firstTerm = secondTerm // Move these two terms up, as they will used for next calculation
    secondTerm = nextTerm
  }
  let isEqualToProduct = firstTerm * secondTerm === prod
  return [firstTerm, secondTerm, isEqualToProduct]
}

const n = 70

Number.MAX_SAFE_INTEGER //?
console.log(fib(n))
console.log(closedFib(n))
console.log(quickFib(n))
console.log(closedFibR(n))
console.log(quickFibR(n))
console.log(cheapFib(n))
console.log(cheapFibR(n))

Math.log(fib(40)) //?
Math.log(fib(5) * Math.sqrt(5)) / Math.log(ϕ) //?
ϕ ** 45 //?
fib(45) //?
const bigN = 80
fib(bigN) //?
ϕ ** bigN //?
const ratioF = fib(bigN) / ϕ ** bigN //?
1 / Math.sqrt(5) //?

let prod = 4896
let realX = Math.log(prod * 5) / LN_PHI //?
// let nx = Math.ceil(realX) //?
let nx = Math.round(realX) //?
// let nx = realX //?
let dx = realX - nx //?
nx % 2 !== 0 //?
ψ ** nx //?
let test = ϕ ** nx / 5 //?
let pow = ϕ ** nx //?

let n1 = Math.round((realX - 1) / 2)
let n2 = n1 + 1
let test2 = (ϕ ** n1 * ϕ ** n2) / 5 //?
let test3 = (ϕ ** n1 / sqrt5) * (ϕ ** n2 / sqrt5) //?
let test4 = cheapFibR(n1) * cheapFibR(n2) //?
let test5 = closedFib(n1) * closedFib(n2) //?
console.log(n1, n2)
let [f1, f2] = [fib_memoByArray(n1), fib_memoByArray(n2)]
;[f1, f2] = prod > f1 * f2 ? [f2, fib_memoByArray(n2 + 1)] : [f1, f2]
const result = [f1, f2, f1 * f2 === prod]
console.log(result)
console.log(fib(n1), fib(n2))
console.log(fib_memoByArray(n1), fib_memoByArray(n2))
console.log(quickFibR(n1), quickFibR(n2))

ϕ
let ratio = Number(fib(n + 1)) / Number(fib(n))
console.log(ratio)
console.log(ratio === ϕ)

fib1(4) //?
fib_memoByArray(70) //?

function compareFib(FibFunc: (n: number) => number | bigint, n: number, iterations?: number) {
  const start1 = performance.now()
  let f = FibFunc(n) // First iteration outside of loop will initialize the result type
  for (let i = 1; i < (iterations ?? 1000); i++) {
    FibFunc(n) // Run the function multiple times to measure performance
  }
  const end1 = performance.now()

  // Assume the BigInt implementation is correct, perform the numeric comparison
  // to the best of our ability given the limited precision of JavaScript numbers
  // versus the bigint type.
  const fBigInt: bigint = fibBigInt(n)
  const testPassed = (testValue: number | bigint) => {
    if (typeof testValue === 'bigint') {
      return testValue === fBigInt
    } else {
      return testValue.toString() === fBigInt.toString()
    }
  }

  const passStr = (testValue: number | bigint) => (testPassed(testValue) ? 'PASSED' : 'FAILED')
  console.log(`${passStr(f)} ${FibFunc.name}(${n}) = ${f}, time: ${end1 - start1} ms`)

  return testPassed(f)
}

const findTestIterationCountRecommendation = (
  FibFunc: (n: number) => number | bigint,
  n: number,
  trialIterations: number = 1_000
) => {
  // Increase the number of iterations until we find a suitable count
  let total_Per_ms = 0
  const MAX_ATTEMPTS = 18
  let attempts = 0
  // Make sure our total time running the function is reasonable
  // We may want a minimum threshold to increase the odds we trigger an optimization
  // and a maximum threshold to avoid excessive runtime
  // If node caching is enabled, we may already get the optimized version right at the start.
  // TODO: Investigate node flags and other features to get help to determine when or if
  // we can expect optimizations to kick in and ways to control it.
  const MAX_TEST_TIME = 1000 // 1 second
  const MIN_TEST_TIME = 100 // 100 milliseconds
  let totalIterations = 0
  const startAllTrials = performance.now()

  while (performance.now() - startAllTrials < MAX_TEST_TIME && ++attempts <= MAX_ATTEMPTS) {
    const start = performance.now()
    for (let i = 0; i < trialIterations; i++) {
      FibFunc(n)
    }
    const end = performance.now()
    totalIterations += trialIterations
    const totalTestTimeMs = end - startAllTrials
    if (!totalTestTimeMs) {
      trialIterations = totalIterations // should never reach here if high res performance timers are working correctly!
      // if we keep landing here then something is probably wrong. If so the function will return 0 after all attempts.
    } else {
      total_Per_ms = totalIterations / totalTestTimeMs
      const timeLeft = MIN_TEST_TIME - totalTestTimeMs
      if (timeLeft <= 0) break
      trialIterations = Math.max(1, Math.ceil(timeLeft * total_Per_ms)) // at least 1 more iteration until we hit the minimum time or max attempts
    }
  }

  const endAllTrials = performance.now()
  const totalTestTimeMs = endAllTrials - startAllTrials

  console.log(`\nFunction: ${FibFunc.name}, n: ${n}`)
  console.log(`Total attempts: ${attempts}`)
  console.log(`Total iterations: ${totalIterations}`)
  console.log(`Total test time (ms): ${totalTestTimeMs}`)
  console.log(`Total iterations per millisecond: ${total_Per_ms}`)

  return total_Per_ms * 1000
}

function compareAllFibOf(n: number, iterations: number = 1_000) {
  // const suit = [fibBigInt, fib1, fib2, fib_memoByArray, closedFib, closedFibR, cheapFib, cheapFibR, quickFib, quickFibR]
  const fib_suite = [fibBigInt, fibBigInt2, fib1, fib2, fib_memoByArray, quickFib, quickFibR] // Exclude closed forms
  // We could test closed forms against a given tolerance. They will often have a small error margin due to floating-point precision
  // and the error is more pronounced for larger n.
  const tolerance = 1e-10

  console.log(`\nRunning tests for n = ${n} with ${iterations} iterations`)

  console.log('')
  console.log(`Comparing Fibonacci for n = ${n}`)
  console.log(`Correct (based on the BigInt implementation): ${fibBigInt(n)}`)
  let result = true

  fib_suite.forEach(FibFunc => {
    const res = compareFib(FibFunc, n, iterations)
    result = result && res
  })

  return result
}

const runPerformanceTests_fibonacci = () => {
  // Determine a reasonable number of iterations to run for timing tests
  console.log('\nDetermining a reasonable number of iterations for timing tests...')
  let iterations = (function () {
    const fib_suite = [
      fibBigInt,
      fibBigInt2,
      fib1,
      fib2,
      fib_memoByArray,
      closedFib,
      closedFibR,
      cheapFib,
      cheapFibR,
      quickFib,
      quickFibR,
    ]
    const n = 70

    let result = +Infinity
    fib_suite.forEach(FibFunc => {
      const res = findTestIterationCountRecommendation(FibFunc, n)
      result = Math.min(result, res)
    })

    return Math.ceil(result)
  })()

  // Run the comparison for a range of Fibonacci numbers
  const TEST_RANGE = [66, 80]
  // const TEST_RANGE = [0, 60]
  for (let n = TEST_RANGE[0]; n <= TEST_RANGE[1]; n++) {
    let result = true
    if (!compareAllFibOf(n, iterations)) {
      result = false
    }
    const message = result ? 'All tests passed!' : 'Some tests failed.'
    console.log(message)
  }
}

const productFib_suite = [
  productFib,
  productFib_LN2,
  productFib_LN10,
  productFib2,
  productFib3,
  productFib_theRemix,
  productFib_AdrianB,
]
const runPerformanceTests_productFib = () => {
  // Determine a reasonable number of iterations to run for timing tests
  console.log('\nDetermining a reasonable number of iterations for timing tests...')
  let iterations = (function () {
    const n = 70

    let result = +Infinity
    productFib_suite.forEach(productFibFunc => {
      const testFunc = (n: number) => {
        productFibFunc(27777890035288)
        return 0
      }
      // testFunc.name = productFibFunc.name
      const res = findTestIterationCountRecommendation(testFunc, n)
      result = Math.min(result, res)
    })

    return Math.ceil(result)
  })()
}

// runPerformanceTests_fibonacci()
// runPerformanceTests_productFib()

// in-source test suites
// cspell:disable
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest

  function doTest(prod: number, expected: [number, number, boolean]) {
    productFib_suite.forEach(func => {
      assert.deepEqual(func(prod), expected)
    })
  }

  describe('Fixed Tests', function () {
    it('productFib', function () {
      doTest(4895, [55, 89, true])
      doTest(5895, [89, 144, false])
      doTest(74049690, [6765, 10946, true])
      doTest(84049690, [10946, 17711, false])
      doTest(193864606, [10946, 17711, true])
      doTest(447577, [610, 987, false])
      doTest(602070, [610, 987, true])
    })
  })
}
// cspell:enable
