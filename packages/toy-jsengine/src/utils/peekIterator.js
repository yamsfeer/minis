function isIterable(target) {
  return typeof target[Symbol.iterator] === 'function'
}

// 关于 peekIterator 的示意图
// https://raw.githubusercontent.com/yamsfeer/pic-bed/master/peekIterator.svg

export const createPeekIterator = (source) => {
  if (!isIterable(source)) {
    return null
  }

  // Symbol.iterator 迭代到最后一个元素时，done 仍为 false
  // 再调一次 next 返回 { value: undefined, done: true }
  const it = source[Symbol.iterator]()
  let isDone = false // it 是否迭代完成

  const buffer = [] // 两端都需要增加或删除节点
  const cache = [] // 用栈存储已访问的数据，方便放回


  const peek = () => {
    const value = next()
    putBack()

    return value
  }

  const next = () => {
    if (isDone) {
      return
    }

    if (buffer.length === 0) {
      const { value, done } = it.next()
      isDone = done
      buffer.unshift(value)
    }

    const value = buffer.pop()
    cache.push(value)

    return value
  }

  const hasNext = () => {
    return !(buffer.length === 0 && isDone)
  }

  const putBack = () => {
    if (cache.length === 0) {
      return false
    }
    buffer.push(cache.pop())
    return true
  }

  return {
    peek,
    next,
    hasNext,
    putBack,
  }
}

export const createPeekTokenIterator = (source) => {
  const it = createPeekIterator(source)

  return Object.assign(it, {
    nextMatch(value) {
      const token = this.next()

      if (token.value !== value) {
        throw new Error(`unmatch token ${token.value}, expecte token ${value}`)
      }

      return token
    },
    nextMatchTokenType(type) {
      const token = this.next()

      if (token.type !== type) {
        throw new Error(`unmatch token type ${token.type}, expecte token type ${type}`)
      }

      return token
    }
  })
}
