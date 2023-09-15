import { isLiteral, isNumber, matchQuote } from '../utils/index.js'
import { lexicalException } from './tokenize.js'

export const TokenType = {
  Keyword: Symbol('Keyword'),
  Identifier: Symbol('Identifier'),

  Number: Symbol('Number'),
  String: Symbol('String'),
  Boolean: Symbol('Boolean'),
  Null: Symbol('Null'),
  Undefined: Symbol('Undefined'),

  Operator: Symbol('Operator'),
  Bracket: Symbol('Bracket'),
}

export const endToken = '\0'

export const TokenPrototype = {
  isIdentifier() {
    return this.type === TokenType.Identifier
  },
  isLiteral() {
    return this.type === TokenType.Number
      || this.type === TokenType.String
      || this.type === TokenType.Boolean
      || this.type === TokenType.Null
      || this.type === TokenType.Undefined
  },
  toString() {
    return `type: ${this.type}, value: ${this.value}`
  }
}

export const createToken = (type, value) => {
  const token = Object.create(TokenPrototype)
  token.type = type
  token.value = value

  return token
}

// 关键字，不包含 true, false, null, undefined
const keywords = new Set([
  'let', 'const', 'function', 'if',
  'else', 'for', 'while', 'break', 'return',
])

export const createIdentifierOrKeyword = (it) => {
  let str = ''
  while (it.hasNext() && isLiteral(it.peek())) {
    str += it.next()
  }

  let tokenType = TokenType.Identifier

  if (keywords.has(str)) tokenType = TokenType.Keyword
  else if ('true' === str || 'false' === str) tokenType = TokenType.Boolean
  else if ('null' === str) tokenType = TokenType.Null
  else if ('undefined' === str) tokenType = TokenType.Undefined

  return createToken(tokenType, str)
}
export const createNumber = (it) => {
  let str = ''
  let hasDot = false // 只能出现一次小数点

  while (it.hasNext()) {
    let cur = it.next()

    if (cur === '.') {
      if (hasDot) { // 两个小数点
        throw lexicalException(`Unexpected character ${cur}`)
      }
      hasDot = true
      str += cur
      continue
    }

    if (isNumber(cur)) {
      str += cur
    } else {
      it.putBack()
      return createToken(TokenType.Number, str)
    }
  }
}
export const createOperator = (it) => {
  const START = Symbol('S'),
    ADD = Symbol('+'), SUB = Symbol('-'), MUL = Symbol('*'), DIV = Symbol('/'),
    AND = Symbol('&'), OR = Symbol('|'), NOT = Symbol('!'),
    GT = Symbol('>'), LT = Symbol('<'), EQUAL = Symbol('='),
    POW = Symbol('^'), MOD = Symbol('%')

  let state = START

  while (it.hasNext()) {
    const cur = it.next()

    switch (state) {
      case START:
        switch (cur) {
          case '+': state = ADD; break
          case '-': state = SUB; break
          case '*': state = MUL; break
          case '/': state = DIV; break
          case '&': state = AND; break
          case '|': state = OR; break
          case '!': state = NOT; break
          case '>': state = GT; break
          case '<': state = LT; break
          case '=': state = EQUAL; break
          case '^': state = POW; break
          case '%': state = MOD; break
          case ',': return createToken(TokenType.Operator, ',')
          case ';': return createToken(TokenType.Operator, ';')
          default: break
        } break
      case ADD:
        if (cur === '+') return createToken(TokenType.Operator, '++')
        else if (cur === '=') return createToken(TokenType.Operator, '+=')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '+')
        }
      case SUB:
        if (cur === '-') return createToken(TokenType.Operator, '--')
        else if (cur === '=') return createToken(TokenType.Operator, '-=')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '-')
        }
      case MUL:
        if (cur === '*') return createToken(TokenType.Operator, '**')
        else if (cur === '=') return createToken(TokenType.Operator, '*=')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '*')
        }
      case DIV:
        if (cur === '=') return createToken(TokenType.Operator, '/=')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '/')
        }
      case AND:
        if (cur === '&') return createToken(TokenType.Operator, '&&')
        else if (cur === '=') return createToken(TokenType.Operator, '&=')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '&')
        }
      case OR:
        if (cur === '|') return createToken(TokenType.Operator, '||')
        else if (cur === '=') return createToken(TokenType.Operator, '|=')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '|')
        }
      case NOT:
        if (cur === '=') return createToken(TokenType.Operator, '!=')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '!')
        }
      case GT:
        if (cur === '>') return createToken(TokenType.Operator, '>>')
        else if (cur === '=') return createToken(TokenType.Operator, '>=')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '>')
        }
      case LT:
        if (cur === '<') return createToken(TokenType.Operator, '<<')
        else if (cur === '=') return createToken(TokenType.Operator, '<=')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '<')
        }
      case EQUAL:
        if (cur === '=') return createToken(TokenType.Operator, '==')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '=')
        }
      case POW:
        if (cur === '=') return createToken(TokenType.Operator, '^=')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '^')
        }
      case MOD:
        if (cur === '=') return createToken(TokenType.Operator, '%=')
        else {
          it.putBack()
          return createToken(TokenType.Operator, '%')
        }
    }
  } // end while(it.hasNext())

  throw lexicalException(`Unexpected Error`)
}
export const createString = (it) => {
  let leftQuote = it.next()
  let str = ''

  while (it.hasNext() && !matchQuote(leftQuote, it.peek())) {
    str += it.next()
  }

  if (matchQuote(leftQuote, it.peek())) {
    it.next() // consume 右引号
  } else {
    throw lexicalException(`Unmatched quote ${leftQuote}`)
  }

  return createToken(TokenType.String, str)
}
export const createBracket = (it) => {
  return createToken(TokenType.Bracket, it.next())
}
