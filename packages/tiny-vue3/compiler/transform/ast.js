export const nodeTypes = {
  FunctionDecl: Symbol('FunctionDecl'), // 函数声明
  CallExpression: Symbol('CallExpression'), // 函数调用
  ReturnStatement: Symbol('ReturnStatement'), // 函数返回
  ArrayExpression: Symbol('ArrayExpression'), // 函数参数
  ObjectLiteral: Symbol('ObjectLiteral'), // 对象字面量
  StringLiteral: Symbol('StringLiteral'), // 字符串直接量
  Identifier: Symbol('Identifier'), // 标识符
  Interpolation: Symbol('Interpolation'), // 插值表达式
}

export const createRender = (body = []) => ({
  type: nodeTypes.FunctionDecl,
  id: createIdentifier('render'), // 默认名为 render
  params: [],
  body
})

export const createReturnStatement = (returnStatement) => ({
  type: nodeTypes.ReturnStatement,
  return: returnStatement // 应该返回 h() 函数调用，即 CallExpression
})

export const createCallExpr = (callee, args) => ({
  type: nodeTypes.CallExpression,
  callee: createIdentifier(callee),
  args
})
export const createArrayExpr = elements => ({
  type: nodeTypes.ArrayExpression,
  elements
})
export const createObjectLiteral = value => ({
  type: nodeTypes.ObjectLiteral,
  value
})
export const createStringLiteral = value => ({
  type: nodeTypes.StringLiteral,
  value
})
export const createIdentifier = (name) => ({
  type: nodeTypes.Identifier,
  name
})

export const createInterpolation = (content) => ({
  type: nodeTypes.Interpolation,
  content
})
