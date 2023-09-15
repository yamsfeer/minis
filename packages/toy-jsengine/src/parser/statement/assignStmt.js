import { ASTNodeType, createASTNode } from '../ast.js'
import { parseAtom } from '../atom/atom.js'
import { parseExpr } from '../expression/expr.js'

// AssignStmt => Atom(Identifier) = Expr
export const createAssignStmt = (identifier, expr, lexeme) => {
  const node = createASTNode(ASTNodeType.AssignStmt, 'assign statement')

  node.identifier = identifier
  node.expr = expr
  node.lexeme = lexeme

  return node
}

export const parseAssignStmt = (it) => {
  const identifier = parseAtom(it)
  const lexeme = it.nextMatch('=')
  const expr = parseExpr(it)

  return createAssignStmt(identifier, expr, lexeme)
}
