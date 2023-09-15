import {
  createIdentifierOrKeyword,
  createNumber,
  createOperator,
  createString,
  createBracket,
} from './token.js'

import {
  isSpace,
  isQuote,
  isLiteral,
  isNumber,
  isStrQuote,
  isOperator,
  createPeekIterator,
} from '../utils/index.js'

export const tokenize = (code) => {
  const it = createPeekIterator(code)
  const tokens = []

  while (it.hasNext()) {
    const c = it.peek()

    // 空格，换行符，缩进等
    if (isSpace(c)) {
      it.next()
      continue
    }

    // 括号
    if (isQuote(c)) {
      tokens.push(createBracket(it))
      continue
    }

    // 标识符或关键字，不能以数字开头
    if (isLiteral(c) && !isNumber(c)) {
      tokens.push(createIdentifierOrKeyword(it))
      continue
    }

    // number
    if (isNumber(c)) {
      tokens.push(createNumber(it))
      continue
    }

    // 字符串，单引号，双引号，反引号
    if (isStrQuote(c)) {
      tokens.push(createString(it))
      continue
    }

    // 操作符
    if (isOperator(c)) {
      tokens.push(createOperator(it))
      continue
    }

    // 最后剩下一个 undefined
    if (c === undefined) {
      break
    }

    throw lexicalException(`Unexpected character ${c}`)
  }

  return tokens
}

export const lexicalException = (msg) => new Error(msg)
