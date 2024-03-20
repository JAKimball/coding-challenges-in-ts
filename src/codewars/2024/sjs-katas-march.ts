import { performance } from 'perf_hooks'

import { memoize } from '../../dp/memoize.js'

export function trilingualDemocracy(group: string): string {
  const [l1, l2, l3] = group.split('')

  if (l1 == l2 && l2 == l3) return l1

  if (l2 == l3) return l1
  if (l1 == l3) return l2
  if (l1 == l2) return l3

  return ['D', 'F', 'I', 'K'].find(v => !group.includes(v)) ?? ''
}

class Node {
  left?: Node | null
  right?: Node | null
  value: number

  constructor(value: number, left?: Node | null, right?: Node | null) {
    this.value = value
    this.left = left
    this.right = right
  }
}

function treeByLevels1(rootNode?: Node | null): number[] {
  const result: number[] = []
  if (!rootNode) return result

  const FIFO: Node[] = [rootNode]

  let node: Node | undefined
  while ((node = FIFO.shift())) {
    result.push(node.value)
    node.left && FIFO.push(node.left)
    node.right && FIFO.push(node.right)
  }

  return result
}

function treeByLevels(rootNode?: Node | null): number[] {
  const result: number[] = []
  const FIFO: Node[] = []

  let node = rootNode
  while (node) {
    result.push(node.value)
    node.left && FIFO.push(node.left)
    node.right && FIFO.push(node.right)
    node = FIFO.shift()
  }

  return result
}

// in-source test suites for the above functions
// Modified from: https://www.codewars.com

if (import.meta.vitest) {
  const { assert, describe, expect, it } = import.meta.vitest
  describe('Test trilingualDemocracy', function () {
    function act(group: string, expected: string) {
      const actual: string = trilingualDemocracy(group)
      assert.strictEqual(actual, expected, `for group '${group}'`)
    }

    describe('Example tests', function () {
      const exampleTests: string[][] = [
        ['FFF', 'F'],
        ['IIK', 'K'],
        ['DFK', 'I'],
      ]
      for (const [group, expected] of exampleTests) {
        it(group, function () {
          act(group, expected)
        })
      }
    })
  })

  function stringifyTree(tree: Node | null | undefined) {
    if (tree === null) return 'null'

    let string = ''

    function printNode(node = tree, depth = 0) {
      if (!node) return
      string += '----'.repeat(depth) + node.value + '\n'
      printNode(node.left, depth + 1)
      printNode(node.right, depth + 1)
    }

    printNode()
    return string
  }

  function doTest(tree: Node | null | undefined, expected: number[]) {
    const log = stringifyTree(tree)
    const actual = treeByLevels(tree)
    assert.deepEqual(actual, expected, `for tree:\n${log}\n`)
  }

  describe('Tests suite', function () {
    it('sample tests', function () {
      doTest(null, [])

      const treeOne = new Node(
        2,
        new Node(8, new Node(1), new Node(3)),
        new Node(9, new Node(4), new Node(5))
      )
      doTest(treeOne, [2, 8, 9, 1, 3, 4, 5])

      const treeTwo = new Node(
        1,
        new Node(8, null, new Node(3)),
        new Node(4, null, new Node(5, null, new Node(7)))
      )
      doTest(treeTwo, [1, 8, 4, 3, 5, 7])
    })

    const MAX_NODES = 50
    const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)
    const randVal = () => randInt(0, +50)
    const randBool = () => Math.random() > 0.5

    function randomTree() {
      const limit = randInt(1, MAX_NODES)
      const root = new Node(randVal())
      const queue = [root]
      const values = []
      let i = 1

      while (queue.length > 0) {
        const node = queue.shift()
        if (!node) continue
        values.push(node.value)
        if (i < limit && randBool()) {
          const child = new Node(randVal())
          node.left = child
          queue.push(child)
          i++
        }

        if (i < limit && randBool()) {
          const child = new Node(randVal())
          node.right = child
          queue.push(child)
          i++
        }
      }

      return { root, values }
    }

    it('random tests', function () {
      for (let i = 0; i < 100; i++) {
        const { root: tree, values: expected } = randomTree()
        doTest(tree, expected)
      }
    })
  })
}
