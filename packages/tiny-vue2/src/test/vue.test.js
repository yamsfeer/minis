import { assert } from 'chai';
import Watcher from '../observer/watcher.js';
import Vue from '../vue.js';


describe('vue', () => {
  describe('data', () => {
    const vm = new Vue({
      data: {
        msg: 'hello',
        count: 0
      }
    })

    it('data 的属性代理到 vm', () => {
      assert.equal(vm.msg, 'hello')
    })
    it('响应式 data', () => {
      let count = null
      new Watcher(vm, 'count', newVal => count = newVal)
      vm.count++
      assert.equal(vm.count, count)
      vm.count++
      assert.equal(vm.count, count)
    })
  })

  describe('methods', () => {
    const vm = new Vue({
      data: { count: 0 },
      methods: {
        increase() { this.count++ },
        decrease() { this.count-- },
      }
    })

    it('vm 访问 methods', () => {
      assert.exists(vm.increase)
      assert.exists(vm.decrease)
    })
    it('method 绑定 vm 上下文', () => {
      vm.increase()
      assert.equal(vm.count, 1)
      vm.decrease()
      assert.equal(vm.count, 0)
    })
  })
})
