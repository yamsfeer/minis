
let activeEffect
let effectStack = []

export function effect(fn, options = {}) {
  function effectFn() {
    cleanup(effectFn)

    // 维护 effectStack，使得 effect 可以嵌套
    activeEffect = effectFn
    effectStack.push(effectFn)

    const res = fn()

    // 维护 effectStack
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]

    return res // computed 需要返回值
  }

  effectFn.deps = [] // 包含本身的 deps 集合，用于 cleanup
  effectFn.options = options // 等待 trigger 的调度执行判断

  if (!options.lazy) {
    effectFn()
  }
  return effectFn
}

function cleanup(effectFn) {
  effectFn.deps.forEach(set => set.delete(effectFn))
  effectFn.deps.length = 0
}

const targetMap = new WeakMap() // target => depsMap

export function track(target, key) {
  if (!activeEffect) {
    return // 没有 activeEffect 不需要 track
  }

  let depsMap = targetMap.get(target)

  if (!depsMap) {
    // key => deps
    // weakmap 的 key 不可是基本类型，否则会报错 Invalid value used as weak map key
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let deps = depsMap.get(key)

  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  deps.add(activeEffect)
  activeEffect.deps.push(deps) // cleanup
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const deps = depsMap.get(key)
  if (!deps) return

  const effectsToRun = new Set() // 创建临时集合，防止 cleanup 死循环
  deps.forEach(effectFn => {
    // 如果 trigger 触发的副作用函数等于当前正在执行的 activeEffect，则不执行
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })

  // 执行 effectFn
  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) { // 调度执行
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
