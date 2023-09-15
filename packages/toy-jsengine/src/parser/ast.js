export const ASTNodeType = {
  // Atom
  Identifier: Symbol('Identifier'), // 标识符
  Literal: Symbol('Literal'), // 直接量

  // Expression
  UnaryExpr: Symbol('UnaryExpr'), // 一元表达式
  BinaryExpr: Symbol('BinaryExpr'), // 二元表达式

  /* Statement */
  AssignStmt: Symbol('AssignStmt'),

  IfStmt: Symbol('IfStmt'),
  ForStmt: Symbol('ForStmt'),
  WhileStmt: Symbol('WhileStmt'),
  IfStmt: Symbol('IfStmt'),
  DeclStmt: Symbol('DeclStmt'),

  BreakStmt: Symbol('BreakStmt'), // break 语句
  ContinueStmt: Symbol('ContinueStmt'), // continue 语句
  ReturnStmt: Symbol('ReturnStmt'), // return 语句

  Block: Symbol('Block'),

  // function
  FuncDeclStmt: Symbol('FuncDeclStmt'),
  FuncArgs: Symbol('FuncArgs'),
  FuncCallStmt: Symbol('FuncCallStmt'),

}

export const ASTNodePrototype = {
  setParent(node) {
    this.parent = node
  }
}

export const createASTNode = (type, label) => {
  const node = Object.create(ASTNodePrototype)

  node.type = type
  node.label = label

  node.lexeme = null
  node.parent = null

  return node
}
