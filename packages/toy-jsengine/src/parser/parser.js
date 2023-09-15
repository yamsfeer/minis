import { tokenize } from '../lexer/tokenize.js'
import { createPeekTokenIterator } from '../utils/peekIterator.js'

export const parser = (source) => {
  const tokens = tokenize(source)
  const tokenIterator = createPeekTokenIterator(tokens)

  // 一段程序通常从语句开始，而且语句包含了表达式和原子
  const ast = parseStmt(tokenIterator)

  const program = createAstNode()
  program.addChild(ast)

  return program
}
