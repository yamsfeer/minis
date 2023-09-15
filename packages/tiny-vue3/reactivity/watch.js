import { effect } from './effect.js'

export function watch(source, cb, options = {}) {
  const getter = typeof source === 'function'
    ? source // 传递函数指定观测属性
    : () => traverse(source) // 传入对象则遍历所有属性

  let oldVal, newVal

  const effectFn = effect(getter, {
    lazy: true, // 注册 effect 时不执行 effectFn
    scheduler() {
      call()
    }
  })

  function call() {
    newVal = effectFn()
    cb(newVal, oldVal)
    oldVal = newVal
  }

  if (options.immediate) {
    call()
  } else {
    oldVal = effectFn()
  }
}

function isPrimitive(value) {
  return typeof value !== 'object' || value === null
}

// 遍历对象的所有属性，触发 track
function traverse(value, hasSeen = new Set()) {
  if (isPrimitive(value) || hasSeen.has(value))
    return

  hasSeen.add(value)
  Object.keys(value).forEach(k => traverse(value[k], hasSeen))

  return value
}
