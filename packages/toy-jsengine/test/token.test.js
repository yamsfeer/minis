import { assert } from 'chai'
import { tokenize } from '../src/lexer/tokenize.js'
import {
  TokenType,
  createBracket,
  createIdentifierOrKeyword,
  createNumber,
  createOperator,
  createString
} from '../src/lexer/token.js'
import { createPeekIterator } from '../src/utils/index.js'

describe('create token', () => {
  function assertToken(fn, expectedTokenType, units) {
    units.forEach((code) => {
      const it = createPeekIterator(code)
      const token = fn(it)

      assert.equal(token.type, expectedTokenType)
    })
  }

  it('createIdentifierOrKeyword', () => {
    assertToken(
      createIdentifierOrKeyword,
      TokenType.Keyword,
      [`const`, `function`, `for`]
    )
    assertToken(
      createIdentifierOrKeyword,
      TokenType.Identifier,
      [`name`, 'foo', 'keyword']
    )
  })
  it('createNumber', () => {
    assertToken(
      createNumber,
      TokenType.Number,
      [`123`, `0.123`, `123.456`, `1.000`]
    )
  })
  it('createOperator', () => {
    assertToken(
      createOperator,
      TokenType.Operator,
      [`+`, `-`, `*`, `/`, `=`, `==`, `^`, `<`, `<=`, `>`, `>=`]
    )
  })
  it('createString', () => {
    assertToken(
      createString,
      TokenType.String,
      [
        `'single quote string'`,
        `"double quote string"`,
      ]
    )
  })
  it('createBracket', () => {
    assertToken(
      createBracket,
      TokenType.Bracket,
      [`{`, `}`]
    )
  })
})

describe('tokenize', () => {
  it('tokenize expression', () => {
    const tokens = tokenize(`a + b`)

    console.log(tokens)
  })

  it('tokenize statement', () => {
    const tokens = tokenize(`
      let a = 1

      if (a > 0) {
        const a = 1
      }

      function foo() {
        return a
      }

      while(true) {
        foo()
      }
    `)

    // console.log(tokens)
  })
})
