import Observer, { defineReactive, observe } from '../vue2/observer/observer.js'
import Watcher from '../vue2/observer/watcher.js'
import { assert } from 'chai'

describe('defineReactive', () => {
  it('添加 getter 和 setter', () => {
    const obj = { foo: 'bar' }
    defineReactive(obj, 'foo')
    const descriptor = Object.getOwnPropertyDescriptor(obj, 'foo')
    assert.exists(descriptor.get)
    assert.exists(descriptor.set)
  })
  it('获取原来的值', () => {
    const obj = { foo: 'bar' }
    defineReactive(obj, 'foo')
    assert.equal(obj.foo, 'bar')
  })
})

describe('observer 对象', () => {
  it('walk', () => {
    const obj = {
      foo: 'foo',
      bar: 'bar',
    }
    new Observer(obj)
    Object.keys(obj).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key)
      assert.exists(descriptor.get)
      assert.exists(descriptor.set)
    })
  })
  /* it('对象属性值是对象', () => {
    const obj = {
      foo: 'foo',
      bar: { baz: 'baz'},
    }
    new Observer(obj)

    const descriptor = Object.getOwnPropertyDescriptor(obj.bar, 'baz')
    assert.exists(descriptor.get)
    assert.exists(descriptor.set)
  }) */

  it('observeArray', () => {
    const obj1 = { foo: 'foo' }
    const obj2 = { foo: 'foo' }
    new Observer([obj1, obj2])
    Object.keys(obj2).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(obj2, key)
      assert.exists(descriptor.get)
      assert.exists(descriptor.set)
    })
  })
})

describe('observe 函数', () => {
  it('创建 observer', () => {
    const obj = { foo: 'bar' }
    observe(obj)
    assert.equal(obj.__ob__ instanceof Observer, true)
  })
  /* it('不重复创建', () => {
    const obj = { foo: 'bar' }
    const watcher1 = observe(obj)
    const watcher2 = observe(obj)

    assert.strictEqual(watcher1, watcher2)
  }) */
})

describe('watcher', () => {
  it('自动更新', () => {
    const data = { foo: 'bar' }
    let foo1 = 'bar'
    let foo2 = 'bar'

    new Observer(data)
    new Watcher(data, 'foo', newval => foo1 = newval)
    new Watcher(data, 'foo', newval => foo2 = newval)

    data.foo = 'reavtive' // 修改值，触发派发更新

    assert.equal(foo1, data.foo)
    assert.equal(foo2, data.foo)
  })
})
