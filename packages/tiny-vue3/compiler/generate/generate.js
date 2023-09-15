import { nodeTypes } from '../transform/ast'

const context = {
  code: '',
  push(code) {
    context.code += code
  },
  indentSpace: '  ',
  currentIndent: 0, // 缩进级数，每级两个空格
  newline() {
    context.code += '\n' + context.indentSpace.repeat(context.currentIndent)
  },
  indent() {
    context.currentIndent++
    context.newline()
  },
  deindent() {
    context.currentIndent--
    context.newline()
  },
}

export default function generate(jsAST) {
  genNode(jsAST, context)

  return context.code
}

function genNode(node, context) {
  switch (node.type) {
    case nodeTypes.FunctionDecl:
      genFunctionDecl(node, context)
      break
    case nodeTypes.ReturnStatement:
      genReturnStatement(node, context)
      break
    case nodeTypes.CallExpression:
      genCallExpression(node, context)
      break
    case nodeTypes.ArrayExpression:
      genArrayExpression(node, context)
      break
    case nodeTypes.ObjectLiteral:
      genObjectLiteral(node, context)
      break
    case nodeTypes.StringLiteral:
      genStringLiteral(node, context)
      break
    case nodeTypes.Identifier:
      genIdentifier(node, context)
      break
    case nodeTypes.Interpolation:
      genInterpolation(node, context)
      break
    default:
      break
  }
}

function genNodeList(nodes, context) {
  nodes.forEach((node, index) => {
    genNode(node, context)
    if (index < nodes.length - 1) {
      context.push(',')
    }
  });
}

function genFunctionDecl(node, context) {
  const { push, indent, deindent } = context

  push(`function ${node.id.name}`)
  push('(')

  genNodeList(node.params, context)

  push(')')
  push('{')

  indent()
  node.body.forEach(n => genNode(n, context))
  deindent()

  push('}')
}

function genReturnStatement(node, context) {
  context.push(`return `)
  genNode(node.return, context)
}

function genCallExpression(node, context) {
  const { push } = context
  const { callee, args } = node
  push(`${callee.name}`) // callee(args)
  push('(')
  genNodeList(args, context)
  push(')')
}

// node.value 是 element 的 props，它是一个对象数组
// 每个对象对应一个 prop
// { type: nodeTypes.Attributes, name, value }
function genObjectLiteral(node, context) {
  if (node.value === null) {
    context.push(`null`)
    return
  }

  context.push(`{`)
  Object.entries(node.value).forEach(([key, value]) => {
    context.push(`${key}:'${value}'`)
  })
  context.push(`}`)
}

// { "type": "StringLiteral", "value": value }
function genStringLiteral(node, context) {
  context.push(`'${node.value}'`)
}

function genArrayExpression(node, context) {
  context.push('[')
  genNodeList(node.elements, context)
  context.push(']')
}

function genIdentifier(node, context) {
  context.push(`${node.value}`)
}

// 插值表达式
function genInterpolation(node, context) {
  context.push(`ctx.${node.content}`)
}
