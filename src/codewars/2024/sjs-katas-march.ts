import { performance } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

export function trilingualDemocracy(group: string): string {
  const [l1, l2, l3] = group.split('')
  if (l1 == l2 && l2 == l3) return l1
  if (l1 == l2) return l3
  if (l1 == l3) return l2
  if (l3 == l2) return l1

  const langs = ['D', 'F', 'I', 'K']

  return langs.find(v => {
    return !group.includes(v)
  })!
}

declare class Node {
  left?: Node
  right?: Node

  value: number
}

function treeByLevels(rootNode?: Node) {
  const result: Node[] = []
  if (!rootNode) return result

  const FIFO: Node[] = [rootNode]

  while (FIFO.length > 0) {
    const node = FIFO.shift()!
    result.push(node.value)
    node.left && FIFO.push(node.left)
    node.right && FIFO.push(node.right)
  }

  return result
}

/***************************
 * Example test template
 */

export function isTriangle(a: number, b: number, c: number): boolean {
  const sum = a + b + c
  return sum - 2 * Math.max(a, b, c) > 0
}

// in-source test suites
if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('isTriangle tests', () => {
    it('should pass basic tests', () => {
      expect(isTriangle(1, 2, 2)).toBe(true)
      expect(isTriangle(7, 2, 2)).toBe(false)
      expect(isTriangle(1, 2, 3)).toBe(false)
    })
  })
}
