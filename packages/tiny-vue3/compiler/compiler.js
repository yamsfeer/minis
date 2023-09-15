import parse from './parse/parse.js'
import transform from './transform/transform.js'
import generate from './generate/generate.js'

export default function compile(template) {
  // const tokens = tokenize(template)
  // const AST = analyse(tokens)
  const ast = parse(template)
  const astWithJSNode = transform(ast)
  const renderCode = generate(astWithJSNode.jsNode)

  return renderCode
}
