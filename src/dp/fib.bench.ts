import { describe, bench } from 'vitest'
import { digitCount } from './fib.js'
describe('digitCount(n)', () => {
  bench('digitCount(9)', () => {
    digitCount(9)
  })
  bench('digitCount(99999)', () => {
    digitCount(99999)
  })
})
