import { bench, describe } from 'vite-plus/test'
import { digitCount } from './fib.js'
describe('digitCount(n)', () => {
  bench('digitCount(9)', () => {
    digitCount(9)
  })
  bench('digitCount(99999)', () => {
    digitCount(99999)
  })
})
