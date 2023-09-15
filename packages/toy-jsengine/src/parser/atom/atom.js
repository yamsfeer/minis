import { TokenType } from '../../lexer/token'
import { ASTNodeType, createASTNode } from '../ast'

export const createIdentifier = (lexeme) => {
  const node = createASTNode(ASTNodeType.Identifier, 'identifier')
  node.lexeme = lexeme
  return node
}
export const createLiteral = (lexeme) => {
  const node = createASTNode(ASTNodeType.Literal, 'literal')
  node.lexeme = lexeme
  return node
}

export const parseAtom = (it) => {
  const token = it.peek()

  if (token.type === TokenType.Identifier) {
    return createIdentifier(token)
  } else if (token.isLiteral()) {
    return createLiteral(token)
  }
}
