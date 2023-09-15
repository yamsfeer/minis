import { reactive } from '../../reactivity/reactive.js'
import { effect } from '../../reactivity/effect.js'

describe('reactive', () => {

  it('reactive an object', () => {
    const target = { foo: 1 }
    const obj = reactive(target)

    expect(target.foo).toEqual(1)
    expect(obj.foo).toEqual(1)

    obj.foo = 2
    expect(obj.foo).toEqual(2)
  })

  it('reactive multi object', () => {
    const target1 = { foo: 1 }
    const target2 = { foo: 2 }
    const obj1 = reactive(target1)
    const obj2 = reactive(target2)

    expect(obj1.foo).toEqual(1)
    expect(obj2.foo).toEqual(2)

    obj1.foo = 10
    obj2.foo = 20
    expect(obj1.foo).toEqual(10)
    expect(obj2.foo).toEqual(20)
  })

})

describe('effect', () => {
  it('auto rerun effect', () => {
    const obj = reactive({ foo: 1 })
    let value

    effect(() => {
      value = obj.foo
    })

    expect(value).toEqual(1)

    obj.foo = 2
    expect(value).toEqual(2)
  })

  it('cleanup outdated effect fn', () => {
    let value
    const obj = reactive({ text: 'ok', ok: true })
    effect(() => value = obj.ok ? obj.text : 'not ok')

    expect(value).toEqual('ok')

    obj.ok = false
    expect(value).toEqual('not ok')
    obj.text = 'ok'
    expect(value).toEqual('not ok')
  })

  it('nested effect', () => {
    let value
    const obj1 = reactive({ foo: 1 })
    const obj2 = reactive({ foo: 2 })

    effect(() => {
      value = obj1.foo
      effect(() => value = obj2.foo)
    })

    expect(value).toEqual(2)
    obj2.foo = 20
    expect(value).toEqual(20)
  })

  it('self-propagation', () => {
    const obj = reactive({ foo: 1 })
    effect(() => obj.foo++)

    expect(obj.foo).toEqual(2)
  })

  it('schedule effect', () => {
    const queue = new Set()
    let isFlushing = false

    function flush() {
      if (isFlushing) // 正在清空
        return

      isFlushing = true
      Promise.resolve()
        .then(() => queue.forEach(job => job())) // 在微任务中清空 queue
        .finally(() => {
          isFlushing = false
          queue.clear()
        })

    }

    const obj = reactive({ bar: 0 })
    let invokes = 0

    const effectFn = effect(() => {
      obj.bar
      invokes++
    }, {
      scheduler(effectFn) {
        queue.add(effectFn) // 加入队列
        flush() // 清空队列
      }
    })

    obj.bar = 2
    obj.bar = 3
    obj.bar = 4

    // 此时 invokes 仍在微任务中清空，清空完之后 invokes 才是 2
    Promise.resolve().then(() => expect(invokes).toEqual(2))
  })
})
