export const type = obj => {
  return Object.prototype.toString
    .call(obj)
    .replace(/(^\[\w+\s+)|(\]$)/g, '')
    .toLowerCase()
}

export function define(obj,target, key) {
  Object.defineProperty(obj, key, {
    get() {
      return target[key]
    },
    set(key) {
      target[key] = val
    }
  })
}
