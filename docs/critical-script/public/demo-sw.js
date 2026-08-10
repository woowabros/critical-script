// A throttled network for the benchmark, in the same spirit as the throttling built into
// browser developer tools. It holds a response back and hands the body over no faster than
// the asked-for rate, so the wait is real and the browser times it like any other request.
//
// It knows nothing about the pages it serves. A request states what it wants:
//
//   ?latency=<ms>    wait this long before answering, once, like a round trip
//   ?think=<ms>      wait this long as well, standing for a server working on the answer
//   ?rate=<bytes/s>  hand the body over at no more than this rate
//
// `latency` and `think` are added together here on purpose. From the browser's side they
// are the same thing: time before the first byte. Only the page knows which is which.
//
// Nothing is stored and nothing is measured here. Keeping it this dumb is deliberate: a
// later deploy cannot find it serving anything stale, and changing a preset in the app
// never means changing this file.

/**
 * Each chunk costs one timer, and a timer is never exact. Sizing chunks by the rate keeps
 * every wait near this long, so the error stays a couple of percent instead of piling up
 * over the hundreds of short waits a fixed chunk size would need.
 */
const CHUNK_MS = 100

const MIN_CHUNK = 4 * 1024

/**
 * One pipe shared by every request in flight, so that parallel requests contend for it the
 * way they would on a real connection. Without this each request would get the full rate
 * to itself and a page with several assets would come in far faster than the rate says.
 */
const pipe = { rate: 0, readyAt: 0 }

function sleep(ms) {
  return ms <= 0 ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, ms))
}

/** Claims time on the shared pipe for `bytes`, and waits until that time comes round. */
async function claim(bytes, rate) {
  const now = Date.now()

  pipe.readyAt = Math.max(now, pipe.readyAt) + (bytes / rate) * 1000

  // Measured against the pipe's own clock rather than the last wake-up, so a timer that
  // fires late does not push everything queued behind it.
  await sleep(pipe.readyAt - Date.now())
}

function paced(buffer, rate) {
  const bytes = new Uint8Array(buffer)
  const size = Math.max(MIN_CHUNK, Math.round((rate * CHUNK_MS) / 1000))
  let sent = 0

  return new ReadableStream({
    async pull(controller) {
      if (sent >= bytes.byteLength) {
        controller.close()

        return
      }

      const chunk = bytes.subarray(sent, Math.min(sent + size, bytes.byteLength))

      sent += chunk.byteLength

      await claim(chunk.byteLength, rate)
      controller.enqueue(chunk)
    },
  })
}

self.addEventListener('install', () => {
  void self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

function asked(url, name) {
  const value = Number(url.searchParams.get(name))

  return Number.isFinite(value) && value > 0 ? value : 0
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  const latency = Math.min(asked(url, 'latency'), 10_000)
  const think = Math.min(asked(url, 'think'), 10_000)
  const rate = asked(url, 'rate')
  const wait = latency + think

  // Everything else is left alone, so the page loads the way it normally would.
  if (wait === 0 && rate === 0) return

  event.respondWith(
    (async () => {
      const response = await fetch(event.request)
      // The body is pulled first so that holding it back is a wait of its own, rather than
      // something the transfer overlaps with.
      const buffer = await response.arrayBuffer()

      await sleep(wait)

      const headers = new Headers(response.headers)

      // The length still describes the body, but it is arriving in its own time now.
      headers.delete('content-encoding')
      headers.set('content-length', String(buffer.byteLength))
      // Says what this worker did to the response, so a check can tell it apart from a
      // request that never reached the worker at all.
      headers.set('x-demo-throttle', `wait=${wait};rate=${rate};bytes=${buffer.byteLength}`)

      const body = rate === 0 ? buffer : paced(buffer, rate)

      return new Response(body, { headers, status: response.status, statusText: response.statusText })
    })(),
  )
})
