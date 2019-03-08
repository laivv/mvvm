export const type = obj => {
  return Object.prototype.toString
    .call(obj)
    .replace(/(^\[\w+\s+)|(\]$)/g, '')
    .toLowerCase()
}

export function proxy(source, target) {
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      Object.defineProperty(target, key, {
        get() {
          return source[key]
        },
        set(key) {
          source[key] = val
        }
      })
    }
  }
}
