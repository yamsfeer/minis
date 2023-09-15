/** component 对象数据结构
  const Comp = {
    name: 'App',
    data() {
      return { foo: 1 }
    },
    render() {
      return { type: 'div', children: 'hello' }
    }
  }
*/

/** component vnode 数据结构
  const vnode = {
    type: Comp,
    props: {},
    children: []
  }
*/

import { effect } from '../reactivity/effect'
import { reactive } from '../reactivity/reactive'
import { patch } from '../renderer/patch'
import { setCurrentInstance } from './lifecycle'

const queue = new Set()
let isFlushing = false

function queueJob(job) {
  queue.add(job)

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

// 处理组件定义的 props 和 vnode 传递过来的 props
function resolveProps(propsOptions, propsData) {
  const props = {}, attrs = {}

  Object.entries(propsData).forEach(([key, value]) => {
    if (propsOptions.hasOwnProperty(key)) {
      props[key] = value
    } else if (key.startsWith('on')) { // 事件处理函数
      props[key] = value
    } else {
      attrs[key] = value
    }
  })

  return [props, attrs]
}

export function mountComponent(vnode, container) {
  let {
    render,
    setup,
    data,
    props: propsOptions,
  } = vnode.type // component 对象
  const { created, mounted, updated } = vnode.type
  const {
    props: propsData,
    children: slots // slot 数据编译后放在 vnode.children 中
  } = vnode

  const state = reactive(data ? data() : {})
  const [props, attrs] = resolveProps(propsOptions || {}, propsData || {})

  const instance = vnode.component = {
    state,
    slots,
    // props: shallowReactive(props),
    props: reactive(props), // 暂时使用 reactive
    isMounted: false,
    mounted: [], // 当前组件的 mounted hook 处理函数
    subTree: null
  }
  created && created.call(state)

  // 组件：<Comp @change="handler">
  // vnode：props: { onChange() {} }
  // emit('change', payload)
  function emit(event, ...payload) {
    const eventName = `on${event[0].toUpperCase()}${event.slice(1)}` // change => onChange
    const handler = instance.props[eventName]

    if (handler) {
      handler(...payload)
    } else {
      console.error(`事件${event}不存在`)
    }
  }

  setCurrentInstance(instance) // 注册声明周期函数前，要管理当前组件实例，避免出错
  const setupContext = { attrs, emit, slots }
  // 调用 setup 函数，传递 props 和 setupContext，暂不实现 readonly
  // const setupResult = setup(shallowReadonly(instance.props), setupContext)
  const setupResult = setup && setup(instance.props, setupContext)
  setCurrentInstance(null) // 重置

  let setupState = {}
  typeof setupResult === 'function'
    ? render = setupResult // 返回 render 函数，options 里的 render 函数将被覆盖
    : setupState = setupResult // 返回 state

  // 渲染函数需要的数据都从上下文获取，其本质是组件实例的代理
  // 寻找属性的顺序是 state => props => setupState
  const renderContext = new Proxy(instance, {
    get(target, key, receiver) { // target 是 instance
      const { state, props } = target

      if (key === '$slots')
        return target.slots

      return key in state
        ? state[key]
        : key in props
          ? props[key]
          : key in setupState
            ? setupState[key]
            : console.error('属性不存在于 state、props、setupState')
    },
    set(target, key, value, receiver) {
      const { state, props } = target

      key in state
        ? state[key] = value
        : key in props
          ? console.warn('props 是只读的，不可修改')
          : key in setupState
            ? setupState[key] = value
            : console.error('属性不存在于 state、props、setupState')
    }
  })

  effect(() => {
    const subTree = render.call(renderContext)

    if (instance.isMounted) { // 打补丁
      patch(instance.subTree, subTree, container)
      updated && updated.call(renderContext)
    } else { // 首次挂载 subTree
      patch(null, subTree, container)

      // mount hook
      instance.isMounted = true
      instance.mounted.forEach(fn => fn.call(renderContext)) // setup onMounte 注册
      mounted && mounted.call(renderContext) // options api 注册
    }

    instance.subTree = subTree
  }, {
    scheduler(effectFn) {
      // 调度器实现无论状态修改多少次，都只重新渲染一次
      // 由于渲染任务是放在微任务队列中的，所以观察 dom 变化需要 nextTick
      queueJob(effectFn)
    }
  })

}

export function patchComponent(n1, n2, container) {
  const instance = n2.component = n1.component
  const { props } = instance // 当前 props

  // 判断传递给 vnode 的 props 数据是否有变
  if (hasProsChanged(n1.props, n2.props)) {
    const [nextProps] = resolveProps(n2.type.props, n2.props)
    // 更新 props
    Object.entries(nextProps)
      .forEach(([key, value]) => props[key] = value)

    // 删除不存在的 props
    Object.keys(props).forEach(key => {
      if (!key in nextProps) {
        delete props[key]
      }
    })
  }
}

function hasProsChanged(prevProps, nextProps) {
  const nextKeys = Object.keys(nextProps)
  const prevKeys = Object.keys(prevProps)

  // 长度不同，肯定有变化
  if (nextKeys.length !== prevKeys.length) {
    return true
  }

  // 任一个 prop 的值不等
  return nextKeys.some(key => nextProps[key] !== prevProps[key])
}
