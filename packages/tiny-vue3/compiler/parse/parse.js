export const nodeTypes = {
  Root: Symbol('Root'),
  Element: Symbol('Element'),
  Attributes: Symbol('Attributes'),
  Interpolation: Symbol('Interpolation'),
  Expression: Symbol('Expression'),
  Text: Symbol('Text'),
}

const State = {
  DATA: Symbol('DATA'),
  RAWTEXT: Symbol('RAWTEXT'),
}

// tokenize 和 analyse 是 parse 的基本实现
// 以下是完整版 parse，使用递归下降算法
export default function parse(str) {
  const context = {
    source: str,
    state: State.DATA,
    consume(num) {
      if (typeof num === 'string') {
        num = num.length
      }
      context.source = context.source.slice(num)
    },
    consumeSpaces() {
      const match = /^[\t\r\n\f\s]+/.exec(context.source)
      match && context.consume(match[0].length)
    }
  }

  const ancestors = []
  const nodes = parseChildren(context, ancestors)

  return {
    type: nodeTypes.Root,
    children: nodes
  }
}

function isEnd(context, ancestors) {
  if (!context.source) {
    return true // source 处理完成
  }

  // 祖先中找到匹配的标签, ancestors 是一个栈
  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (context.source.startsWith(`</${ancestors[i].tag}`)) {
      return true
    }
  }

  return false
}

function parseChildren(context, ancestors) {
  const nodes = []

  while (!isEnd(context, ancestors)) {
    let node
    if (context.state === State.DATA) {
      // 注意这里的 source 都要往 context 取最新值
      if (context.source[0] === '<' && isAlphabet(context.source[1])) {
        node = parseElement(context, ancestors) // 标签元素
      } else if (context.source.startsWith('{{')) {
        node = parseInterpolation(context) // 插值
      }
    }

    if (!node) {
      node = parseText(context)
    }

    nodes.push(node)
  }

  return nodes
}

function isAlphabet(char) {
  return /[a-z]/i.test(char)
}

function parseTag(context, type = 'start') {
  const { consume, consumeSpaces } = context
  // <div name="xxx"></div>
  const startTagReg = /^<([a-z][^[\t\r\n\f\s/>]*)/i
  const endTagReg = /^<\/([a-z][^[\t\r\n\f\s/>]*)/i

  const [match, tag] = type === 'start'
    // match: '<div', tag: 'div'
    ? startTagReg.exec(context.source)
    // match: '</div', tag: 'div'
    : endTagReg.exec(context.source)

  consume(match)
  consumeSpaces()

  // attributes
  const props = parseAttributes(context)

  const isSelfClosing = context.source.startsWith('/>')
  consume(isSelfClosing ? '/>' : '>')

  return {
    type: nodeTypes.Element,
    tag,
    props,
    children: [],
    isSelfClosing
  }
}

function parseAttributes(context) {
  const { consume, consumeSpaces } = context
  const props = []

  while (
    !context.source.startsWith('>') &&
    !context.source.startsWith('/>')
  ) {
    const [name] = /^[^\t\r\n\f\s/>][^\t\r\n\f\s/>=]*/.exec(context.source)

    consume(name)
    consumeSpaces()
    consume('=')
    consumeSpaces()

    let value = ''
    const DOUBLE_QUOTE = `"`
    const SINGLE_QUOTE = `'`
    const [quote] = context.source
    const isQuoted = quote === SINGLE_QUOTE || quote === DOUBLE_QUOTE

    if (isQuoted) {
      consume(quote)
      const endQuoteIndex = context.source.indexOf(quote)
      if (endQuoteIndex > -1) {
        value = context.source.slice(0, endQuoteIndex)
        consume(value)
        consume(quote)
      } else {
        console.error('引号不匹配')
      }
    } else {
      [value] = /^[^\t\r\n\f\s>]+/.exec(context.source)
      consume(value)
    }
    consumeSpaces()

    props.push({
      type: nodeTypes.Attributes,
      name,
      value
    })
  }

  return props
}

function parseElement(context, ancestors) {
  const element = parseTag(context)
  if (element.isSelfClosing)
    return element

  ancestors.push(element)
  // 每次 parseChildren 之前的空格换行怎么处理
  context.consumeSpaces()
  element.children = parseChildren(context, ancestors)
  context.consumeSpaces()
  ancestors.pop()

  if (context.source.startsWith(`</${element.tag}`)) {
    parseTag(context, 'end')
  } else {
    console.error(`${element.tag}缺少闭合标签`)
  }

  return element
}

function parseText(context) {
  let index = context.source.length // 有可能后面全是文本
  const quoteIndex = context.source.indexOf('<')
  const delimiterIndex = context.source.indexOf('{{')

  // 提取 '<' 之前的内容
  if (quoteIndex > -1) {
    index = quoteIndex
  }
  // 在 '<' 之前还有 '{{'，说明是文本中的插值，提取 '{{' 之前的内容
  if (delimiterIndex > -1 && delimiterIndex < index) {
    index = delimiterIndex
  }

  const content = context.source.slice(0, index)
  context.consume(content)

  return {
    type: nodeTypes.Text,
    content
  }
}

function parseInterpolation(context) {
  const { consume } = context

  consume('{{')
  const closeIndex = context.source.indexOf('}}')
  if (closeIndex < 0) {
    console.error('缺少结束定界符')
  }

  const content = context.source.slice(0, closeIndex)

  consume(content)
  consume('}}')

  return {
    type: nodeTypes.Interpolation,
    content: {
      type: nodeTypes.Expression,
      content
    }
  }
}
