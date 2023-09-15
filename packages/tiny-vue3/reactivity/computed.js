import { effect, track, trigger } from './effect.js'

export function computed(getter) {
  let value, dirty = true

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
      // computed 的依赖数据变化时，手动 trigger
      trigger(computedObj, 'value')
    }
  })

  const computedObj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      // 读取 computed 的值时，手动 track
      track(computedObj, 'value')
      return value
    }
  }

  return computedObj
}
