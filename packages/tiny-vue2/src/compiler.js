import Watcher from './observer/watcher.js'
import { isElementNode, isTextNode } from './utils.js'

export default class Compiler {
  constructor(vm) {
    this.$el = vm.$el
    this.vm = vm
  }

  compile(el) { // root node, 比如 #app
    const childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      if (isTextNode(node)) { // 双括号取值
        this.compileText(node)
      } else if (isElementNode(node)) { // 指令
        this.compileElement(node)
      }

      if (node.childNodes.length > 0) { // 子节点递归
        this.compile(node)
      }
    })
  }

  compileText(node) {
    // 用正则取出双括号
    const vm = this.vm
    const reg = /\{\{(.+?)\}\}/g
    const text = node.textContent

    if (reg.test(text)) {
      const key = RegExp.$1.trim()

      node.textContent = text.replace(reg, vm[key]);
      // 用 watcher 绑定
      new Watcher(vm, key, val => node.textContent = val)
    }
  }

  compileElement(node) {
    const attrs = node.attributes // object

    Object.keys(attrs).forEach(attrKey => {
      const attrName = attrs[attrKey].name
      if (!this.isDirective(attrName)) {
        return
      }
      // 以 v- 开头的属性，比如 v-on:click, v-model
      const directive = attrName.includes(':')
        ? attrName.substr(5) // v-on:
        : attrName.substr(2) // v-
      const vmKey = attrs[attrName].value // count / increase

      this.update(node, directive, vmKey)
    })
  }

  isDirective(attrKey) {
    return attrKey.startsWith('v-')
  }

  update(node, directive, vmKey) {
    const vm = this.vm

    if (directive === 'model') {
      node.value = vm[vmKey] // input.value = vm.count
      new Watcher(vm, vmKey, val => node.value = val)
      node.addEventListener('input', () => vm[vmKey] = node.value)
    } else if (directive === 'click') {
      node.addEventListener(directive, vm[vmKey].bind(vm))
    }
  }
}
