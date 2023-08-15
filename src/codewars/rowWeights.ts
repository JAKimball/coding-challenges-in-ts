function rowWeights(array: number[]) {
  return [
    array.reduce((acc, cur, i) => (i % 2 ? acc : acc + cur), 0),
    array.reduce((acc, cur, i) => (i % 2 ? acc + cur : acc), 0),
  ]
}

rowWeights([39, 84, 74, 18, 59, 72, 35, 61]) //?
