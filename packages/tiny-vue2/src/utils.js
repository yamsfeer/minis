// 判断一个对象是否含有 key
export function hasOwn(obj, key) {
  return Object.hasOwnProperty(obj, key)
}

export function isTextNode(node) {
  return node.nodeType === 3
}

export function isElementNode(node) {
  return node.nodeType === 1
}
