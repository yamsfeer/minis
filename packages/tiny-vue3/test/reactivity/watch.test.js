import { reactive } from '../../reactivity/reactive.js'
import { watch } from '../../reactivity/watch.js'

describe('watch', () => {
  it('basic', () => {
    const obj = reactive({ foo: 1 })

    let value = 0
    watch(obj, () => value++)

    expect(value).toEqual(0)
    obj.foo = 2
    expect(value).toEqual(1)
  })

  it('oldValue and newValue', () => {
    const obj = reactive({ foo: 1 })

    let newValue, oldValue
    watch(() => obj.foo, (newVal, oldVal) => {
      newValue = newVal
      oldValue = oldVal
    })

    obj.foo = 2
    expect(oldValue).toEqual(1)
    expect(newValue).toEqual(2)
    obj.foo = 3
    expect(oldValue).toEqual(2)
    expect(newValue).toEqual(3)
  })
})
