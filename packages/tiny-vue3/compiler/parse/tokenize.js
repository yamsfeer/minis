const State = {
  data: Symbol('data'),

  tagOpen: Symbol('tagOpen'),
  tagName: Symbol('tagName'),

  text: Symbol('text'),

  tagEnd: Symbol('tagEnd'),
  tagEndName: Symbol('tagEndName'),
}

export const tokenTypes = {
  tagOpen: Symbol('tagOpen'),
  text: Symbol('text'),
  tagEnd: Symbol('tagEnd'),
}

const createTagOpen = (tagName) => ({ type: tokenTypes.tagOpen, name: tagName })
const createText = (text) => ({ type: tokenTypes.text, content: text })
const createTagEnd = (tagName) => ({ type: tokenTypes.tagEnd, name: tagName })

export default function tokenize(str) {
  const tokens = []
  let state = State.data
  let tmp = '' // 字符拼接
  let c

  while (str.length) {
    c = str[0] // 当前字符
    switch (state) {
      case State.data:
        if (c === '<') { state = State.tagOpen }
        else if (isAlphabet(c)) {
          state = State.text
          tmp += c
        }

        break
      case State.tagOpen:
        if (isAlphabet(c)) {
          state = State.tagName
          tmp += c
        }
        else if (c === '/') { state = State.tagEnd }

        break
      case State.tagName:
        if (isAlphabet(c)) { tmp += c }
        else if (c === '>') { // 取得一个 tagName
          state = State.data
          tokens.push(createTagOpen(tmp))
          tmp = ''
        }

        break
      case State.text:
        if (isAlphabet(c)) { tmp += c }
        else if (c === '<') {
          state = State.tagOpen
          tokens.push(createText(tmp))
          tmp = ''
        }

        break
      case State.tagEnd:
        if (isAlphabet(c)) {
          state = State.tagEndName
          tmp += c
        }
        break
      case State.tagEndName:
        if (isAlphabet(c)) { tmp += c }
        else if (c === '>') {
          state = State.data
          tokens.push(createTagEnd(tmp))
          tmp = ''
        }
        break

      default: break
    }
    str = str.slice(1) // consume
  }

  return tokens
}

function isAlphabet(char) {
  return /[a-zA-Z0-9]/.test(char)
}
