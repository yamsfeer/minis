import { track, trigger } from './effect.js'

const proxyMap = new WeakMap()

export function reactive(target) {
  if (proxyMap.get(target)) {
    return proxyMap.get(target)
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const newValue = Reflect.set(target, key, value, receiver) // 要先设置值再 trigger
      trigger(target, key)
      return newValue
    }
  })

  proxyMap.set(target, proxy)

  return proxy
}
