import Compiler from './compiler.js'
import { observe } from './observer/observer.js'
import { hasOwn } from './utils.js'

// src.xx => vm.xx
function proxy(vm, src) {
  Object.keys(src).forEach(key => {
    Object.defineProperty(vm, key, {
      enumerable: true,
      configurable: true,
      get() { return src[key] }, // this.$data.key
      set(val) { src[key] = val }
    })
  })
}

class Vue {
  constructor(options) {
    options = this.normalize(options)

    this.$options = options
    this.$el = typeof options.el === 'string'
      ? document.querySelector(options.el)
      : options.el
    this.$data = options.data
    this.$methods = options.methods

    this.init()
    this.compiler = new Compiler(this)
    this.compiler.compile(this.$el)
  }

  // 标准化传入的 options
  normalize(options) {
    const basicOptions = {
      data: {},
      methods: {},
    }
    const normalized = Object.assign(basicOptions, options)
    return normalized
  }

  init() {
    this.initState()
    // this.$mount(vm.$el)
  }

  // state 有 props、data、methods、computed 等
  initState() {
    this.initData()
    this.initMethods()
  }

  initData() {
    const vm = this
    const data = vm.$data // 传入的 data 只能是对象

    Object.keys(data).forEach(key => {
      // 检查重名
      if (
        hasOwn(vm.$props, key) ||
        hasOwn(vm.$methods, key)
      ) {
        return warn(`"${key}" has been defined as a prop or method.`)
      }
    })

    proxy(vm, data) // 将 vm.$data 的属性代理到 vm
    observe(data) // 转为响应式对象
  }

  initMethods() {
    const vm = this
    const methods = vm.$methods

    Object.keys(methods).forEach(key => {
      if (hasOwn(vm.$props, key)) {
        return warn(`"${key}" has been defined as a prop.`)
      }

      vm[key] = methods[key].bind(vm) // 绑定 vm 上下文，使其能访问 this
    })

    proxy(vm, methods)
  }

  $mount(el) {
    el = document.querySelector(el)
    if (el === document.body || el === document.documentElement) {
      console.warn(`Do not mount Vue to <html> or <body> - mount to normal elements instead.`)
      return this
    }

    const opts = this.$options

  }
}

export default Vue
