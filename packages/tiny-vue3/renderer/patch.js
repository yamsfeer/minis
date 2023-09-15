/* vnode 数据结构

  const vnode = {
    type: 'div',
    props: { foo: 'foo' },
    children: []
  }
*/

import {
  patchComponent,
  mountComponent
} from '../component/component'
import patchKeyedChildren from './diff'


export function patch(n1, n2, container, anchor) {
  // 如果旧节点存在但新旧类型不同，肯定不能复用，直接 unmount
  if (n1 && n1.type !== n2.type) {
    unmount(n1)
    n1 = null
  }

  if (typeof n2.type === 'string') { // 普通元素
    n1
      ? patchElement(n1, n2, container, anchor)
      : mountElement(n2, container, anchor)
  } else if (typeof n2.type === 'object') { // 组件
    n1
      ? patchComponent(n1, n2, container, anchor)
      : mountComponent(n2, container, anchor)
  } else if (n2.type === 'Fragment') { /* Fragment 类型 */ }
}

function mountElement(vnode, container, anchor) {
  const { type: tag, props = {}, children } = vnode

  // create element
  const el = document.createElement(tag)

  // process props
  Object.entries(props).forEach(([key, value]) => {
    patchProps(el, key, null, value)
  })

  // process children
  if (typeof children === 'string') {
    el.innerHTML = children
  } else if (Array.isArray(children)) {
    children.forEach(child => patch(null, child, el))
  }

  // mount
  container.appendChild(el)

  vnode.el = el
}

export function unmount(vnode) {
  const el = vnode.el
  const parentNode = el.parentNode

  parentNode.removeChild(el)
}

function patchProps(el, key, preVal, nextVal) {
  if (/^on/.test(key)) { // 处理事件属性
    const eventName = key.slice(2).toLowercase()
    preVal && el.removeEventListener(eventName, preVal) // 移除旧事件
    el.addEventListener(eventName, nextVal)
  } else if (key === 'class') {
    /* 处理 class 属性 */
  } else {
    //  html attribute 是对应 dom properties 的初始值
    // el.setAttribtute(key, value)
    el[key] = nextVal
  }
}

function patchElement(n1, n2, container) {
  // patch props
  const el = n1.el
  const oldProps = n1.props || {}, newProps = n2.props || {}

  // 更新新props
  for (const key of Object.keys(newProps)) {
    if (newProps[key] !== oldProps[key]) {
      patchProps(el, key, oldProps[key], newProps[key])
    }
  }

  // 删除旧props
  for (const key of Object.keys(oldProps)) {
    if (!newProps.hasOwnProperty(key)) {
      patchProps(el, key, oldProps[key], null)
    }
  }

  // patch children
  patchChildren(n1, n2, el)
}

function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    if (Array.isArray(n1.children)) {
      n1.children.forEach(c => unmount(c))
    }
    container.innerHTML = n2.children
  } else if (Array.isArray(n2.children)) {
    if (Array.isArray(n1.children)) { // 新旧子节点都是数组，需要 diff
      // diff
      // n1.children.forEach(c => unmount(c))
      // n2.children.forEach(c => patch(null, c, container))
      patchKeyedChildren(n1, n2, container)
    } else {
      container.innerHTML = ''
      n2.children.forEach(c => patch(null, c, container))
    }
  } else if (!n2.children) {
    if (Array.isArray(n1.children)) {
      n1.children.forEach(c => unmount(c))
    } else {
      container.innerHTML = ''
    }
  }
}
