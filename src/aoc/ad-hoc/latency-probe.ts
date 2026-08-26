import { writeFileSync, writeSync } from 'fs'
import { connect, createServer, type Socket } from 'net'

// Usage:
//   node latency-probe.ts [durationMs] [outputFile] [flushIntervalSec]
//   durationMs = 0 means run until Ctrl+C / SIGTERM.
//   outputFile: samples are buffered in memory and rewritten to this file
//     every flushIntervalSec (default 30). A final summary is written on exit.
//
// If nothing is listening on port 9999, this script starts an echo server
// on 9999 instead. The server announces "server-shutdown" to connected
// clients when it exits so they can summarize and close cleanly.

const PORT = 9999
const POLL_INTERVAL_MS = 1000

const outFile = process.argv[3]
const flushIntervalMs = Number(process.argv[4] ?? 30) * 1000

/** Synchronous stdout log: safe in signal handlers even with redirected output. */
const log = (s: string): void => {
  try {
    writeSync(1, s + '\n')
  } catch {
    /* EPIPE/EBADF — e.g. piped into a closed reader; ignore */
  }
}

/** Rewrite the whole sample log to the output file in one shot. */
const flushSamples = (lines: string[]): void => {
  if (!outFile) return
  try {
    writeFileSync(outFile, lines.join('\n') + '\n')
  } catch {
    /* keep probing even if the file becomes unwritable */
  }
}

const startProbe = (): void => {
  const c = connect(PORT)
  const roundTripTimes: number[] = []
  const sampleLines: string[] = []

  const record = (s: string): void => {
    const stamped = `${new Date().toISOString()} ${s}`
    sampleLines.push(stamped)
    log(stamped)
  }

  // Periodic full rewrite instead of per-sample appends:
  // avoids watcher/OneDrive churn and minimizes SSD writes.
  if (outFile && flushIntervalMs > 0) {
    const iv = setInterval(() => {
      flushSamples(sampleLines)
    }, flushIntervalMs)
    iv.unref()
  }

  c.on('error', err => {
    log(`connection error: ${(err as NodeJS.ErrnoException).code ?? err.message}`)
  })

  // Server told us it is shutting down: summarize what we have and exit.
  c.on('data', buf => {
    const text = buf.toString()
    if (text.includes('server-shutdown')) {
      record('server announced shutdown')
      summarizeAndExit()
      return
    }
    const d = Number(process.hrtime.bigint() - t0) / 1e6
    roundTripTimes.push(d)
    record(`RTT: ${d.toFixed(2)} ms`)
    setTimeout(() => {
      t0 = process.hrtime.bigint()
      if (c.writable) c.write('x')
    }, POLL_INTERVAL_MS)
  })

  let t0 = process.hrtime.bigint()

  c.on('connect', () => {
    c.write('x') // kick off
  })

  // A clean FIN from the server also ends the session.
  c.on('end', () => {
    record('connection ended by server')
    summarizeAndExit()
  })

  const summarizeAndExit = (): void => {
    const n = roundTripTimes.length
    if (n === 0) {
      record('No completed round trips.')
    } else {
      const sorted = [...roundTripTimes].sort((a, b) => a - b)
      const avg = roundTripTimes.reduce((a, v) => a + v, 0) / n
      const pct = (p: number): number => sorted[Math.min(n - 1, Math.floor((p / 100) * n))]
      record(
        `samples: ${n.toFixed(0)}, avg: ${avg.toFixed(2)} ms, min: ${sorted[0].toFixed(2)} ms, ` +
          `p50: ${pct(50).toFixed(2)} ms, p95: ${pct(95).toFixed(2)} ms, p99: ${pct(99).toFixed(2)} ms, max: ${sorted[n - 1].toFixed(2)} ms`
      )
    }
    flushSamples(sampleLines)
    c.destroy()
    process.exit(0)
  }

  process.on('SIGINT', summarizeAndExit)
  process.on('SIGTERM', summarizeAndExit)

  const duration = Number(process.argv[2] ?? 10_000)
  if (duration > 0) {
    log(`Running for ${duration.toString()} ms`)
    setTimeout(summarizeAndExit, duration)
  } else {
    log('Running until terminated (Ctrl+C for summary)')
  }
}

const startEchoServer = (): void => {
  const clients = new Set<Socket>()

  const announceShutdown = (): void => {
    for (const s of clients) {
      try {
        s.write('server-shutdown')
        s.end()
      } catch {
        /* client already gone */
      }
    }
    log('echo server shutting down')
    process.exit(0)
  }

  process.on('SIGINT', announceShutdown)
  process.on('SIGTERM', announceShutdown)

  createServer((s: Socket) => {
    clients.add(s)
    s.on('close', () => clients.delete(s))
    // Ignore resets from clients disconnecting abruptly
    s.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code !== 'ECONNRESET') log(`socket error: ${err.code ?? err.message}`)
    })
    s.pipe(s)
  }).listen(PORT, () => {
    log(`echo server listening on ${PORT.toString()}`)
  })
}

// Probe first; fall back to server mode if the port has no listener.
const probe = connect(PORT)
probe.once('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'ECONNREFUSED') {
    probe.destroy()
    startEchoServer()
  } else {
    log(`unexpected error: ${err.message}`)
    process.exit(1)
  }
})
probe.once('connect', () => {
  probe.destroy()
  startProbe()
})
