import { tokenTypes } from './tokenize.js'

export const nodeTypes = {
  Root: Symbol('Root'),
  Element: Symbol('Element'),
  Text: Symbol('Text'),
}

const createRootNode = () => ({
  type: nodeTypes.Root,
  children: []
})

const createElementNode = (name) => ({
  type: nodeTypes.Element,
  tag: name,
  children: []
})

const createTextNode = (content) => ({
  type: nodeTypes.Text,
  content
})


export default function analyse(tokens) {
  const root = createRootNode()
  const stack = [root]

  while (tokens.length) {
    const parent = stack[stack.length - 1]
    const token = tokens.shift()

    switch (token.type) {
      case tokenTypes.tagOpen:
        const elementNode = createElementNode(token.name)

        parent.children.push(elementNode)
        stack.push(elementNode)
        break
      case tokenTypes.text:
        const textNode = createTextNode(token.content)
        parent.children.push(textNode)
        break
      case tokenTypes.tagEnd:
        stack.pop()
        break
    }
  }

  return root
}
