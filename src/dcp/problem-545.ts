/**
 * Return the length and rand of the longest run of consecutive
 * integers in an array of integers.
 *
 * @param {Array<number>} list
 * @returns
 */
function longestConsecutiveRun(list: Array<number>) {
  const map: Map<number, number> = new Map()
  let maxLen = 0
  let maxFirst = 0
  let maxLast = 0

  for (const x of list) {
    if (map.has(x)) continue
    let first = map.get(x - 1) ?? x
    let last = map.get(x + 1) ?? x
    map.set(x, x)
    map.set(first, last)
    map.set(last, first)
    if (last - first + 1 > maxLen) {
      maxLen = last - first + 1
      maxFirst = first
      maxLast = last
    }
  }
  return { maxLen, maxFirst, maxLast }
}

let rl = longestConsecutiveRun([8, 1, 3, 7, 4, 19, 6, 9, 15, 5, 7])
rl

/**
 * Test longestConsecutiveRun
 *
 * @param {number} rangeSize
 */
function superTest(rangeSize: number) {
  const list: Array<number> = new Array()
  let [len, first, last] = [0, 0, 0]

  do {
    list.push(Math.floor(Math.random() * rangeSize))
    ;({ maxLen: len, maxFirst: first, maxLast: last } = longestConsecutiveRun(list))
    console.log(`list length: ${list.length}  longest run -> ${first}..${last} length: ${len}`)
  } while (len < rangeSize)
}

superTest(100)

// This should be in cursive!

const showList = (list: Array<number>) =>
  list.reduce<string>((p, c) => (p ? `${p}, ` : '') + c.toString(), '')
console.log(showList([1, 2, 3]))

const swapAltBits = (x: number) => ((x & 0b01010101) << 1) | ((x & 0b10101010) >>> 1)

let b = swapAltBits(0b01100110).toString(2).padStart(8, '0')
b

const testSwapAltBits = () => {
  let i = 0
  while (i === swapAltBits(swapAltBits(i))) {
    i++
  }
  return i === 0b100000000
}

let passed = testSwapAltBits()
passed

//=============================================

/**
 * Daily Coding Problem: Problem #545 [Hard]
 * This problem was asked by Twitter.
 *
 * Given a binary tree, find the lowest common ancestor (LCA) of
 * two given nodes in the tree. Assume that each node in the tree
 * also has a pointer to its parent.
 *
 * According to the definition of LCA on Wikipedia:
 * “The lowest common ancestor is defined between two nodes v and w
 * as the lowest node in T that has both v and w as descendants
 * (where we allow a node to be a descendant of itself).”
 */

class BinaryTreeNode {
  left?: BinaryTreeNode
  right?: BinaryTreeNode
  parent?: BinaryTreeNode
  value: any

  constructor(left?: BinaryTreeNode, right?: BinaryTreeNode, value?: any) {
    this.left = left
    this.right = right
    this.parent = undefined
    this.value = value
    if (left) left.parent = this
    if (right) right.parent = this
  }
}

const BinaryTreeLowestCommonAncestor = (
  treeRoot: BinaryTreeNode,
  nodeV: BinaryTreeNode,
  nodeW: BinaryTreeNode
): BinaryTreeNode => {}

const testTree1 = new BinaryTreeNode(undefined, undefined, 'x')

function printBinaryTree(treeRoot: BinaryTreeNode) {
  const queue = []
  let node = treeRoot
  while (node) {}
}

//========================================//
