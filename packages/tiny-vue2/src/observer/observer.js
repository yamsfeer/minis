import Dep from './dep.js'
import { hasOwn } from '../utils.js'

// 为对象属性添加 getter 和 setter
export function defineReactive(obj, key) {
  let value = obj[key]
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      /* 依赖收集 */
      if (Dep.target) {
        dep.addSub(Dep.target)
      }

      return value
    },
    set(newVal) {
      /* 派发更新 */
      value = newVal
      dep.notify()
    },
  })
}

export default class Observer {
  constructor(value) {
    this.value = value
    value.__ob__ = this

    Array.isArray(value)
      ? this.observeArray(value)
      : this.walk(value)
  }

  walk(obj) {
    Object.keys(obj).forEach(key => {
      /* const val = obj[key]
      if (val instanceof Object) { // 深层对象的 observe？
        return observe(val)
      } */
      defineReactive(obj, key)
    })
  }

  observeArray(arr) {
    arr.forEach(obj => observe(obj))
  }
}

// 将一个对象转为响应式对象
export function observe(obj) {
  // 已经是 observerable 对象
  if (hasOwn(obj, '__ob__') && obj.__ob__ instanceof Observer) {
    return obj.__ob__
  }

  return new Observer(obj)
}
