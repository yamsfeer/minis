import { computed } from '../../reactivity/computed.js'
import { reactive } from '../../reactivity/reactive.js'
import { effect } from '../../reactivity/effect.js'

describe('computed', () => {
  it('basic', () => {
    const obj = reactive({ foo: 1, bar: 2 })
    const sum = computed(() => obj.foo + obj.bar)

    expect(sum.value).toEqual(3)

    obj.foo = 2
    expect(sum.value).toEqual(4)
  })

  it('cache computed value', () => {
    const obj = reactive({ foo: 1, bar: 2 })

    let invokes = 0
    const sum = computed(() => {
      invokes++
      return obj.foo + obj.bar
    })

    expect(sum.value).toEqual(3)
    expect(invokes).toEqual(1)

    obj.foo = 2
    expect(invokes).toEqual(1)

    expect(sum.value).toEqual(4)
    expect(invokes).toEqual(2)
  })

  it('use computed in effect', () => {
    const obj = reactive({ foo: 1, bar: 2 })
    const sum = computed(() => obj.foo + obj.bar)

    let value
    effect(() => {
      value = sum.value
    })

    expect(value).toEqual(3)

    obj.foo = 2
    expect(value).toEqual(4)
  })
})
