function define(obj, key, watcher, keyPath) {
  var value = obj[key]
  Object.defineProperty(obj, key, {
    get: function() {
      return value
    },
    set: function(val) {
      if (value === val) {
        return
      }
      var oldValue = value
      value = val
      watcher && watcher(keyPath, val, oldValue)
    }
  })
}

function observe(obj, watcher, keyPath) {
  var isRoot = !keyPath
  var rootPath = keyPath
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (isRoot) {
        keyPath = key
      } else {
        keyPath = rootPath + '.' + key
      }
      define(obj, key, watcher, keyPath)
      if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        observe(obj[key], watcher, keyPath)
      }
    }
  }
  return obj
}

export default function(obj, watcher) {
  return observe(obj, watcher, false)
}
