import fs from 'fs'

// Synchronously read our data file
const input = fs.readFileSync('assets/aoc/2015/aoc2015-d2.txt', 'utf8')

let totalSqrFt = 0

input.split('\n').forEach(box => {
  const [l, w, h] = box.split('x').map(v => parseInt(v))
  const [t, f, s] = [l * w, w * h, h * l]
  totalSqrFt += 2 * (t + f + s) + Math.min(t, f, s)
})

console.log('total square feet of wrapping paper', totalSqrFt)

let totalRibbonFt = 0

input.split('\n').forEach(box => {
  const [l, w, h] = box.split('x').map(v => parseInt(v))
  const [pt, pf, ps] = [2 * (l + w), 2 * (w + h), 2 * (h + l)]
  totalRibbonFt += Math.min(pt, pf, ps) + l * w * h
})

console.log('total feet of ribbon', totalRibbonFt)

//
