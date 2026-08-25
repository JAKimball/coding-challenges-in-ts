import { connect } from 'net'

const c = connect(9999)

const roundTripTimes: number[] = []

c.on('connect', () => {
  let t0 = process.hrtime.bigint()

  // Each echo we receive marks one completed round trip
  c.on('data', () => {
    const d = Number(process.hrtime.bigint() - t0) / 1e6
    roundTripTimes.push(d)
    console.log(`RTT: ${d.toFixed(2)} ms`)
    setTimeout(() => {
      t0 = process.hrtime.bigint()
      if (c.writable) c.write('x')
    }, 1000)
  })

  c.write('x') // kick off
})

const summarizeAndExit = (): void => {
  const n = roundTripTimes.length
  if (n === 0) {
    console.log('No completed round trips.')
  } else {
    const sorted = [...roundTripTimes].sort((a, b) => a - b)
    const avg = roundTripTimes.reduce((a, v) => a + v, 0) / n
    const pct = (p: number): number => sorted[Math.min(n - 1, Math.floor((p / 100) * n))]
    console.log(
      `\nsamples: ${n.toFixed(0)}, avg: ${avg.toFixed(2)} ms, min: ${sorted[0].toFixed(2)} ms, ` +
        `p50: ${pct(50).toFixed(2)} ms, p95: ${pct(95).toFixed(2)} ms, p99: ${pct(99).toFixed(2)} ms, max: ${sorted[n - 1].toFixed(2)} ms`
    )
  }
  c.destroy()
  process.exit(0)
}

process.on('SIGINT', summarizeAndExit)
process.on('SIGTERM', summarizeAndExit)

const duration = Number(process.argv[2] ?? 10_000)
if (duration > 0) {
  console.log(`Running for ${duration.toString()} ms`)
  setTimeout(summarizeAndExit, duration)
}
