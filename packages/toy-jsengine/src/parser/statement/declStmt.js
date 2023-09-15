import { ASTNodeType, createASTNode } from '../ast.js'
import { parseAtom } from '../atom/atom.js'
import { parseExpr } from '../expression/expr.js'

export const createDecl = (identifier, expr) => {
  const node = createASTNode(ASTNodeType.DeclStmt, 'declare statement')

  node.identifier = identifier
  node.expr = expr

  return node
}

// DeclStmt => let Identifier = Expr
export const parseDeclStmt = (it) => {
  it.nextMatch('let') // 消耗掉 let，暂不考虑 const

  const identifier = parseAtom(it)
  it.nextMatch('=')
  const expr = parseExpr(it)

  return createDecl(identifier, expr)
}
