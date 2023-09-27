export const ints = (str: string) => {
  return [...str.matchAll(/-?\d+/g)].map(match => +match[0])
}

let inputIterator: IterableIterator<string>

export const initReadLn = (input: string) => {
  const inputArray = input.split('\n')
  while (inputArray[inputArray.length - 1] === '') inputArray.pop()
  return (inputIterator = inputArray.values())
}

export const readLn = (pInputIterator?: IterableIterator<string>): string | undefined => {
  return (pInputIterator ?? inputIterator).next().value
}

// export const showVisited = (tl: Point, br: Point) => {
//   const field: string[][] = []
//   for (let r = tl.y; r <= br.y; r++) {
//     field[r] = []
//     for (let c = tl.x; c <= br.x; c++) field[r][c] = '.'
//   }
//   for (const key of visited) {
//     const [c, r] = lib.ints(key)
//     field[r][c] = 'X'
//   }
//   let result = ''
//   for (let r = tl.y; r <= br.y; r++) {
//     let rowStr = ''
//     for (let c = tl.x; c <= br.x; c++) {
//       rowStr += ` ${field[r][c]}`
//     }
//     result += rowStr + '\n'
//   }
//   console.log(result)
// }
