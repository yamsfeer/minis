import {
  createRender,
  createCallExpr,
  createArrayExpr,
  createObjectLiteral,
  createStringLiteral,
  createIdentifier,
  createInterpolation,
  createReturnStatement,
} from './ast.js'
import { nodeTypes } from '../parse/parse.js'

const context = {
  currentNode: null,
  childIndex: 0,
  parent: null,
  replaceNode(newNode) {
    context.currentNode = newNode
    context.parent.children[context.childIndex] = newNode
  },
  removeNode() {
    if (!context.parent) return

    // 从父节点的 children 中删除
    context.parent.children.splice(context.childInex, 1)
    context.currentNode = null
  },
  nodeTransforms: [ // 转换节点
    transformRoot,
    transformElement,
    transformInterpolaton,
    transformText
  ]
}

function transformRoot(node) {
  if (node.type !== nodeTypes.Root)
    return

  return () => {
    /* Root 节点对应硬编码的 render 函数
       function render() { return ... } */
    const rtn = createReturnStatement(node.children[0].jsNode)
    const body = [rtn]
    node.jsNode = createRender(body)
  }
}

function transformElement(node) {
  if (node.type !== nodeTypes.Element)
    return

  return () => {
    /**
     * <div foo="bar"><p></p></div>
      * ===> h('div', { foo: 'bar' }, [h('p', null, [])])
     * const createCallExpr = (callee, args) => ({...})
     */

    const props = node.props.length
      ? node.props.reduce((acc, prop) => {
        acc[prop.name] = prop.value
        return acc
      }, {})
      : null
    node.jsNode = createCallExpr(
      'h',
      [
        createStringLiteral(node.tag), // 'div'
        createObjectLiteral(props), // props
        createArrayExpr(node.children.map(c => c.jsNode)) // children
      ]
    )
  }
}

function transformInterpolaton(node) {
  if (node.type !== nodeTypes.Interpolation)
    return

  /* {
    type: nodeTypes.Interpolation,
    content: {
      type: nodeTypes.Expression,
      content
    }
  } */
  node.jsNode = createInterpolation(node.content.content)
}

function transformText(node) {
  if (node.type !== nodeTypes.Text)
    return
  node.jsNode = createStringLiteral(node.content)
}

function traverse(root, context) {
  if (!root) return

  const exitFns = []

  context.currentNode = root
  for (const transform of context.nodeTransforms) {
    // transform 返回一个函数说明它需要在子节点处理完毕后进行
    const onExit = transform(root, context)
    onExit && exitFns.push(onExit)

    if (!context.currentNode) // 删除节点后，该节点的后序转换及其子树节点都不需要处理
      return
  }

  if (root.children) {
    root.children.forEach((child, index) => {
      context.parent = context.currentNode
      context.childIndex = index
      traverse(child, context)
    })
  }

  // 当前节点退出阶段，子节点已转换完成，注意从后往前遍历
  while (exitFns.length) {
    const fn = exitFns.pop()
    fn()
  }
}

export default function transform(ast) {
  traverse(ast, context)

  return ast
}
