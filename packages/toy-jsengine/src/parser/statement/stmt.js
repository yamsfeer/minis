
export const parseStmt = (it) => {
  if (!it.hasNext()) {
    return null
  }

  // 通过前两个 token 判断
  const token = it.next(), nextToken = it.peek()
  it.putPack()

  if (token.isIdentifier() && nextToken.value === '=')
    return parseAssignStmt(it) // 赋值语句：a = b
  else if (token.value === 'let')
    return parseDeclStmt(it) // 声明语句：let a
  else if (token.value === 'if')
    return parseIfStmt(it) // if 语句：if (a) {}
  else if (token.value === 'for')
    return parseForStmt(it) // for 语句：for () {}
  else if (token.value === 'while')
    return parseWhileStmt(it) // while 语句：while(a) {}
  else if (token.value === 'function')
    return parseFuncDeclStmt(it) // 函数声明语句：function a() {}
  else
    return parseExpr(it) // 表达式语句
}
