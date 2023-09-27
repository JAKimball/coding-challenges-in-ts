import { memoize } from './memoize.js'

type AckermannFunction = (m: number, n: bigint) => bigint

type CountedFunction<F> = F & {
  callCount: number
}

export const ackermann: CountedFunction<AckermannFunction> = ((m: number, n: bigint) => {
  ackermann.callCount++
  if (m === 0) return n + 1n
  if (n === 0n) return ackermann(m - 1, 1n)
  return ackermann(m - 1, ackermann(m, n - 1n))
}) as CountedFunction<AckermannFunction>
ackermann.callCount = 0

export const ackermann_m = memoize((m: number, n: bigint): bigint => {
  if (m === 0) return n + 1n
  if (n === 0n) return ackermann_m(m - 1, 1n)
  return ackermann_m(m - 1, ackermann_m(m, n - 1n))
})

export const ackermann_test = (ackermann: AckermannFunction) => {
  console.time()
  const mArray: bigint[][] = []
  for (let m = 0; m <= 3; m++) {
    const nArray: bigint[] = []
    for (let n = 0n; n <= 9n; n++) {
      nArray.push(ackermann(m, n))
    }

    mArray.push(nArray)
  }

  console.table(mArray)
  console.timeEnd()
}

export const ackermann_tests = () => {
  ackermann_test(ackermann_m)
  ackermann_test(ackermann)
  console.log(ackermann)

  // console.table(
  //   [...ackermann_m.map.values()],
  //   ['result', 'hitCount', 'stackHeight', 'maxStackHeight', 'branchSize']
  // )
  console.log(ackermann_m.stats, ackermann_m.stats.savings)
}

ackermann_tests()
