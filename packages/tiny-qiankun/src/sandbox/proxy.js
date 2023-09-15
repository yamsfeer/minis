export class ProxySandbox {
  constructor() {
    this.type = 'ProxySandbox'
    this.isRunning = false

    this.fakeWindow = {}
    this.rawWindow = window

    this.proxy = new Proxy(this.fakeWindow, {
      get(target, prop) {
        // 先去 fakeWindow 找，再去 rawWindow 找
        return prop in target
          ? target[prop]
          : this.rawWindow[prop]
      },
      set(target, prop, value) {
        // 属性设置到 fakeWindow 上
        if (this.isRunning) {
          target[prop] = value
        }
      },
    })
  }

  active() {
    this.isRunning = true
  }

  inactive() {
    this.isRunning = false
  }

}
