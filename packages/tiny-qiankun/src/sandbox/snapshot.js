export class SnapshotSandbox {
  constructor() {
    this.type = 'SnapshotSandbox'
    this.snapshot = null // 保存 window 的快照
    this.modifiedProps = null // 保存 active 时对 window 的修改
    this.isRunning = false
  }

  active() {
    // 将当前 window 进行 snapshot
    this.snapshot = {}

    Object.entries(window)
      .forEach(([prop, value]) => this.snapshot[prop] = value)

    // 把之前的 modifiedProps 恢复
    Object.entries(this.modifiedProps)
      .forEach(([prop, value]) => window[prop] = value)

    this.modifiedProps = {} // 重置
    this.isRunning = true
  }

  inactive() {
    // 对比 snapshot 和当前 window
    Object.entries(window).forEach(([prop, value]) => {
      if (this.snapshot[prop] !== value) {
        this.modifiedProps[prop] = value // 记录变更
        window[prop] = this.snapshot[prop] // 恢复快照
      }
    })

    this.isRunning = false
  }
}
