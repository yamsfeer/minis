export const evaluate = (code) => {
  const tokens = tokenize(code)
  const ast = parse(tokens)

  run(ast)
}
