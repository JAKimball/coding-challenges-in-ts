import { performance } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

export function smallEnough(a: number[], limit: number): boolean {
  return !a.some(n => n > limit)
}

export function tribonacci([a, b, c]: [number, number, number], n: number): number[] {
  const result = [a, b, c]

  let i = 3
  while (i < n) {
    ;[a, b, c] = [b, c, a + b + c]
    result.push(c)
    i++
  }

  result.length = n

  return result
}

// https://www.codewars.com/kata/53897d3187c26d42ac00040d/train/javascript

class TNode {
  edges: TNode[]
  value: unknown

  constructor(value: unknown, edges = []) {
    this.value = value
    this.edges = edges
  }
}

// a and b are of type Node
// return whether there is a route from a to b
function getRoute(a: Node, b: Node) {
  return false
}

describe('tests suite', function () {
  const Node = New(TNode)

  const { strictEqual } = require('chai').assert

  function doTest(a, b, expected, graphString) {
    const log = `for getRoute(${a.value}, ${b.value}) in graph:\n${graphString}\n`
    const actual = getRoute(a, b)
    strictEqual(actual, expected, log)
  }

  it('simple acyclic graph', function () {
    const ascii =
      'A ----> B ----> D' +
      '\n' +
      '↑       |' +
      '\n' +
      '|       |     E' +
      '\n' +
      '|       ↓' +
      '\n' +
      '|-----> C' +
      '\n'
    const E = new Node('E'),
      D = new Node('D'),
      C = new Node('C')
    const B = new Node('B', [C, D])
    const A = new Node('A', [B, C])

    const edges = { A, B, C, D, E }
    const matrix = {
      A: {
        A: false,
        B: true,
        C: true,
        D: true,
        E: false,
      },
      B: {
        A: false,
        B: false,
        C: true,
        D: true,
        E: false,
      },
      C: {
        A: false,
        B: false,
        C: false,
        D: false,
        E: false,
      },
      D: {
        A: false,
        B: false,
        C: false,
        D: false,
        E: false,
      },
      E: {
        A: false,
        B: false,
        C: false,
        D: false,
        E: false,
      },
    }
    for (const a in matrix)
      for (const b in matrix[a]) doTest(edges[a], edges[b], matrix[a][b], ascii)
  })

  it('loop ', function () {
    const ascii = 'node----' + '\n' + '↑      |' + '\n' + '|      |' + '\n' + '|------|' + '\n'
    const node = new Node('node')
    node.edges = [node]
    doTest(node, node, true, ascii)
  })

  it('simple cyclic graph ', function () {
    const ascii =
      'A----->B' +
      '\n' +
      '↑      |' +
      '\n' +
      '|      |       F' +
      '\n' +
      '|      |' +
      '\n' +
      '|      ↓' +
      '\n' +
      'D<-----C ----> E' +
      '\n'
    const E = new Node('E'),
      F = new Node('F')
    const A = new Node('A')
    const D = new Node('D', [A])
    const C = new Node('C', [D, E])
    const B = new Node('B', [C])
    A.edges = [B]

    const edges = { A, B, C, D, E, F }
    const matrix = {
      A: {
        A: true,
        B: true,
        C: true,
        D: true,
        E: true,
        F: false,
      },
      B: {
        A: true,
        B: true,
        C: true,
        D: true,
        E: true,
        F: false,
      },
      C: {
        A: true,
        B: true,
        C: true,
        D: true,
        E: true,
        F: false,
      },
      D: {
        A: true,
        B: true,
        C: true,
        D: true,
        E: true,
        F: false,
      },
      E: {
        A: false,
        B: false,
        C: false,
        D: false,
        E: false,
        F: false,
      },
      F: {
        A: false,
        B: false,
        C: false,
        D: false,
        E: false,
        F: false,
      },
    }

    for (const a in matrix)
      for (const b in matrix[a]) doTest(edges[a], edges[b], matrix[a][b], ascii)
  })
})

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
