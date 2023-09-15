import Dep, { pushTarget, popTarget } from './dep.js'

class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    this.key = key
    this.cb = cb

    // 设置 Dep.target 为当前 watcher 并压栈，Dep.target = this
    pushTarget(this)
    this._oldVal = vm[key] // 触发 getter，从而触发依赖收集
    popTarget() // 恢复 depTarget 栈
  }

  update() {
    const newVal = this.vm[this.key]
    this._oldVal = newVal

    this.cb.call(this.vm, newVal)
  }
}

export default Watcher
