export interface DebounceOptions {
  wait?: number
  maxWait?: number
  leading?: boolean
  trailing?: boolean
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 500,
  options: DebounceOptions = {}
): {
  (...args: Parameters<T>): ReturnType<T> | undefined
  cancel: () => void
} {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let maxTimeoutId: ReturnType<typeof setTimeout> | undefined
  let lastInvokeTime = 0
  let lastArgs: Parameters<T> | undefined
  let lastResult: ReturnType<T>
  const { leading = false, trailing = true, maxWait } = options

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs!
    lastInvokeTime = time
    lastArgs = undefined
    lastResult = func(...args)
    return lastResult
  }

  function shouldInvoke(time: number): boolean {
    if (lastArgs === undefined) return false

    const timeSinceLastInvoke = time - lastInvokeTime
    return (
      lastInvokeTime === 0 || timeSinceLastInvoke >= wait || (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    )
  }

  function trailingEdge(time: number): ReturnType<T> | undefined {
    timeoutId = undefined

    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = undefined
    return lastResult
  }

  function timerExpired(): void {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }

    const timeSinceLastInvoke = time - lastInvokeTime
    const timeUntilWait = wait - timeSinceLastInvoke
    const timeUntilMaxWait = maxWait ? Math.min(timeUntilWait, maxWait - timeSinceLastInvoke) : timeUntilWait

    timeoutId = setTimeout(timerExpired, timeUntilMaxWait)
  }

  function debounced(...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args

    if (isInvoking) {
      if (timeoutId === undefined) {
        lastInvokeTime = time
        if (leading) {
          return invokeFunc(time)
        }
        if (maxWait !== undefined) {
          maxTimeoutId = setTimeout(timerExpired, maxWait)
        }
      }
      if (timeoutId === undefined) {
        timeoutId = setTimeout(timerExpired, wait)
      }
      return lastResult
    }

    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, wait)
    }

    return lastResult
  }

  debounced.cancel = function cancel(): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
    if (maxTimeoutId !== undefined) {
      clearTimeout(maxTimeoutId)
      maxTimeoutId = undefined
    }
    lastInvokeTime = 0
    lastArgs = undefined
  }

  return debounced
}
