const { collectCssRule, computeCss } = require('./parser-css')
const layout = require('./layout.js')

const EOF = Symbol('EOF')
const LEFT_BRACKET = '<'
const RIGHT_BRACKET = '>'
const SLASH = '/'
const EQUAL = '='
const SPACE = /[\t\n\f\s]/
const ALPHABET = /[a-zA-Z]/
const SINGLE_QUOTE = '\''
const DOUBLE_QUOTE = '\"'

let currentToken = null
let currentAttr = {
  name: '',
  value: ''
}

function setAttr2Token() {
  currentToken[currentAttr.name] = currentAttr.value
  currentAttr = {
    name: '',
    value: ''
  }
}

const documentElement = {
  type: 'document',
  children: []
}
const stack = [documentElement]
let currentTextNode = null

function emit(token) {
  let top = stack[stack.length - 1]
  let { type: tokenType, tagName: tokenTagName } = token

  if (tokenType === 'startTag') {
    let element = {
      type: 'element',
      tagName: tokenTagName,
      parent: top,
      attributes: [],
      children: [],
    }

    for (const key in token) {
      if (key !== 'type' && key !== 'tagName')
        element.attributes.push({
          name: key,
          value: token[key]
        })
    }

    top.children.push(element)

    if (!token.isSelfClosing)
      stack.push(element)
    computeCss(element)
  } else if (tokenType === 'endTag') {
    if (top.tagName !== tokenTagName)
      throw new Error('tag does not match')
    if (top.tagName === 'style')
      collectCssRule(top.children[0].content)

    // 计算布局信息
    layout(top)

    stack.pop()
    currentTextNode = null
  } else if (tokenType === 'character') {
    if (!currentTextNode) {
      currentTextNode = {
        type: 'character',
        content: ''
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
}

function data(c) {
  if (c === LEFT_BRACKET)
    return tagOpen
  else if (c === EOF)
    return emit({ type: EOF })
  else {
    emit({
      type: 'character',
      content: c
    })
    return data
  }
}

function tagOpen(c) {
  if (c === SLASH)
    return endTagOpen
  else if (c.match(ALPHABET)) {
    currentToken = {
      type: 'startTag',
      tagName: ''
    }
    return tagName(c)
  } else
    throw new Error('invalid first character of tag name')
}

function tagName(c) {
  if (c.match(SPACE))
    return beforeAttributeName
  else if (c === SLASH)
    return selfClosingStartTag
  else if (c.match(ALPHABET)) {
    currentToken.tagName += c.toLowerCase()
    return tagName
  }
  else if (c === RIGHT_BRACKET) {
    emit(currentToken)
    return data
  } else
    return tagName
}

function endTagOpen(c) {
  if (c.match(ALPHABET)) {
    currentToken = {
      type: 'endTag',
      tagName: ''
    }
    return tagName(c)
  }
}

function beforeAttributeName(c) {
  if (c.match(SPACE))
    return beforeAttributeName
  else if (c === RIGHT_BRACKET || c === SLASH || c === EOF)
    return afterAttributeName(c)
  else if (c === EQUAL) {

  } else { // alphabet
    return attributeName(c)
  }
}

function attributeName(c) {
  if (
    c.match(SPACE) ||
    c === SLASH ||
    c === RIGHT_BRACKET ||
    c === EOF
  )
    return afterAttributeName(c)
  else if (c === EQUAL)
    return beforeAttributeValue
  else {
    currentAttr.name += c.toLowerCase()
    return attributeName
  }
}
function beforeAttributeValue(c) {
  if (c === SINGLE_QUOTE)
    return singleQuotedAttributeValue
  else if (c === DOUBLE_QUOTE)
    return doubleQuotedAttributeValue
  else
    return unquotedAttributeValue(c)
}
function singleQuotedAttributeValue(c) {
  if (c === SINGLE_QUOTE) {
    setAttr2Token()
    return afterQuotedAttributeValue
  } else {
    currentAttr.value += c
    return singleQuotedAttributeValue
  }
}
function doubleQuotedAttributeValue(c) {
  if (c === DOUBLE_QUOTE) {
    setAttr2Token()
    return afterQuotedAttributeValue
  } else {
    currentAttr.value += c
    return doubleQuotedAttributeValue
  }
}
function unquotedAttributeValue(c) {
  if (c === SLASH) {
    setAttr2Token()
    return selfClosingStartTag
  } else if (c === RIGHT_BRACKET) {
    setAttr2Token()
    emit(currentToken)
    return data
  } else {
    currentAttr.value += c
    return unquotedAttributeValue
  }
}
function afterQuotedAttributeValue(c) {
  if (c.match(SPACE))
    return beforeAttributeName
  else if (c === SLASH)
    return selfClosingStartTag
  else if (c === RIGHT_BRACKET) {
    setAttr2Token()
    emit(currentToken)
    return data
  }
}


function selfClosingStartTag(c) {
  if (c === RIGHT_BRACKET) {
    currentToken.isSelfClosing = true
    emit(currentToken)
    return data
  }
}

// html tokeniser 标准 https://html.spec.whatwg.org/multipage/parsing.html#tokenization
// 解析 html 状态机 https://tva1.sinaimg.cn/large/008i3skNgy1gwtv7v01omj30lp0bvq3n.jpg

module.exports = {
  parseHTML(html) {
    let state = data
    for (const c of html) {
      state = state(c)
    }
    const dom = stack.pop()
    return dom
  }
}
