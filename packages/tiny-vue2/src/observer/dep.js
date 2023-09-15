// 发布者
class Dep {
  static target = null // 当前收集依赖的 watcher
  static uid = 0

  constructor() {
    this.subs = [] // 订阅者，watcher 对象
    this.id = Dep.uid++ // 每个 dep 对象的 id
  }

  addSub(sub) {
    this.subs.push(sub)
  }
  removeSub(sub) {
    this.subs.filter(s => s === sub)
  }

  notify() {
    // sub 排序，保证按顺序触发
    const subs = this.subs.slice()
    subs.sort((a, b) => a.id - b.id)

    subs.forEach(sub => sub.update())
  }
}

Dep.target = null
const targetStack = []

export function pushTarget(target) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}

export default Dep
