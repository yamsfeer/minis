import { ASTNodeType, createASTNode } from '../ast.js'
import { parseExpr } from '../expression/expr.js'

export const createIfStmt = (expr, block) => {
  const node = createASTNode(ASTNodeType.IfStmt, 'if statement')

  node.expr = expr
  node.block = block

  return node
}

/* IfStmt => if (Expr) Block Tail
   Tail   =>  else Block | else IfStmt | epsilon */
export const parseIfStmt = (it) => {
  it.nextMatch('if')
  it.nextMatch('(')
  const expr = parseExpr(it)
  it.nextMatch(')')
  const block = parseBlock(it)
  const tail = parseIfTail(it)

  const ifStmt = createIfStmt(expr, block)

  if (tail) {
    ifStmt.tail = tail
  }

  return ifStmt
}

export const parseIfTail = (it) => {
  if (!(it.hasNext() && it.peek().value === 'else')) {
    return null
  }

  it.nextMatch('else')

  if (!it.hasNext()) {
    throw new Error(`unmatched else block`)
  }

  const nextToken = it.peek()

  if (nextToken.value === 'if') // else if
    return parseIfStmt(it)
  else if (nextToken.value === '{') // else
    return parseBlock(it)
  else
    return null // epsilon
}
