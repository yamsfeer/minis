import { patch, unmount } from './patch'

function preprocess(oldChildren, newChildren, container) {
  // 预处理左边
  let p = 0
  let oldVnode = oldChildren[p]
  let newVnode = newChildren[p]

  while (oldVnode.key === newVnode.key) { // 用 key 判断节点复用
    patch(oldVnode, newVnode, container)

    p++
    oldVnode = oldChildren[p]
    newVnode = newChildren[p]
  }

  // 预处理右边
  let oldE = oldChildren.length - 1
  let newE = newChildren.length - 1
  oldVnode = oldChildren[oldE]
  newVnode = newChildren[newE]

  while (oldVnode.key === newVnode.key) {
    patch(oldVnode, newVnode, container)

    oldE--
    newE--
    oldVnode = oldChildren[oldE]
    newVnode = newChildren[newE]
  }

  return [p, oldE, newE]
}

export default function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children
  const newChildren = n2.children

  // 这三个变量后面都需要访问或修改
  let [p, oldE, newE] = preprocess(oldChildren, newChildren, container)


  if (p > oldE && p <= newE) { // 旧节点遍历完，新节点有剩余
    const anchorIndex = newE + 1
    const anchor = anchorIndex < newChildren.length
      ? newChildren[anchorIndex].el
      : null

    // [p, newE] 之间的节点需要全新挂载
    while (p <= newE) {
      patch(null, newChildren[p++], container, anchor)
    }
  } else if (p > newE && p <= oldE) { // 新节点遍历完，旧节点有剩余
    // [p, oldE] 之间的节点需要卸载
    while (p <= oldE) {
      unmount(oldChildren[p++])
    }
  } else {
    // 预处理后，新旧节点都有剩余
    const oldS = p
    const newS = p
    quickdiff(oldChildren, newChildren, oldS, newS, oldE, newE, container)
  }
}

function quickdiff(oldChildren, newChildren, oldS, newS, oldE, newE, container) {
  // 构造 source 数组
  // oldS 和 newS 是一样的
  const source = new Array(newE - oldS + 1).fill(-1)
  const keyIndex = new Map()

  for (let i = newS; i <= newE; i++) {
    keyIndex.set(newChildren[i].key, i)
  }

  let move = false
  let max = 0

  for (let i = oldS; i <= oldE; i++) {
    const oldVnode = oldChildren[i]
    const key = oldVnode.key

    if (keyIndex.has(key)) { // 旧节点出现在新节点列表中，可复用
      const newVnodeIndex = keyIndex.get(key)
      // source 数组从 newS 开始算，记录在新节点在旧节点列表中的索引
      source[newVnodeIndex - newS] = i

      patch(oldVnode, newChildren[newVnodeIndex], container)

      if (newVnodeIndex < max) {
        move = true
      } else {
        max = newVnodeIndex
      }
    } else {
      // 旧节点没有出现在新节点列表中
      unmount(oldVnode)
    }

  }

  if (move) {
    const seq = lis(source)

    // 从后往前遍历 seq
    let s = seq.length - 1
    // 从后往前遍历 source 数组
    for (let i = source.length - 1; i >= 0; i--) {
      if (i === seq[s]) { // 属于最长递增子序列的节点不需要移动
        s--
        continue
      }

      const pos = i + newS
      const newVnode = newChildren[pos]

      const nextPos = pos + 1
      const anchor = nextPos < newChildren.length
        ? newChildren[nextPos].el
        : null

      if (source[i] === -1) { // 全新挂载
        patch(null, newVnode, container, anchor)
        continue
      }
      if (seq[s] !== i) { // 移动节点
        // anchor is not defined?
        container.insertBefore(newVnode.el, anchor)
      }
    }
  }
}

function lis(nums) {
  // base case
  const dp = nums.map((num, index) => `${index}`) // 记录序列元素的下标

  // 穷举
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j] && dp[j].length + 1 > dp[i].length) {
        dp[i] = `${dp[j]}${i}` // 状态转移
      }
    }
  }

  // 找出最长
  let max = Number.MIN_SAFE_INTEGER
  let result = null
  for (const seq of dp) {
    if (seq.length > max) {
      result = seq
      max = seq.length
    }
  }

  return Array.from(result) // 字符串转数组
}
