type MemoFunction<F> = F & {
  map: Map<string, unknown>
  stats: {
    equivalentCallCount: number
    hitCount: number
    missCount: number
    readonly savings: number
  }
}

type MemoizableFunction<T> = (...args: unknown[]) => T

// To allow any bigint type arguments to be indexed in the map...
// (see: https://github.com/GoogleChromeLabs/jsbi/issues/30)
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
;(BigInt.prototype as any).toJSON = function () {
  return (this as bigint).toString()
}

/**
 * Generically create a memoized version of the function passed.
 * The function can recursively call its memoized version.
 * @param {Function} nonMemoFunction
 * @returns
 */

export const memoize = <F extends MemoizableFunction<T>>(nonMemoFunction: F): MemoFunction<F> => {
  // export const memoize = (f: Function) => {

  interface Cache {
    branchSize?: number
    hitCount: number
    maxStackHeight?: number
    result: unknown
    stackHeight?: number
  }

  const map = new Map<string, Cache>()
  const stats = {
    equivalentCallCount: 0,
    hitCount: 0,
    missCount: 0,
    get savings() {
      return (this.equivalentCallCount - this.missCount) / this.equivalentCallCount
    },
  }

  let branchSize = 0
  const branchSizeStack: number[] = []
  let height = 0,
    maxHeight = 0
  const maxHeightStack: number[] = []

  const memoized = (...args: unknown[]) => {
    const key = JSON.stringify(args)

    let cache = map.get(key)
    if (!cache) {
      stats.missCount++
      branchSizeStack.push(branchSize)
      branchSize = 1
      maxHeightStack.push(maxHeight)
      height++
      cache = {
        hitCount: 0,
        result: nonMemoFunction(...args),
      }
      cache.stackHeight = height
      maxHeight = Math.max(maxHeight, height)
      cache.maxStackHeight = maxHeight
      maxHeight = Math.max(maxHeight, maxHeightStack.pop() ?? 0)
      height--
      cache.branchSize = branchSize // record AFTER calling
      branchSize += branchSizeStack.pop() ?? 0
      map.set(key, cache)
    } else {
      stats.hitCount++
      cache.hitCount++
      branchSize += cache.branchSize ?? 0
    }

    stats.equivalentCallCount += branchSize
    return cache.result
  }

  memoized.map = map
  memoized.stats = stats
  return memoized as MemoFunction<F>
}
