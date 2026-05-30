export function withClientTimeout<T>(
  promise: Promise<T>,
  message = '网络连接超时，请检查网络后重试',
  timeoutMs = 12000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(message))
    }, timeoutMs)

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timer))
  })
}
