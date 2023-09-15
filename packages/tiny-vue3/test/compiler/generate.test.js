import generate from '../../compiler/generate/generate.js'
import parse from '../../compiler/parse/parse.js'
import transform from '../../compiler/transform/transform.js'

describe('compiler:generate', () => {
  it('basic generate code', () => {
    const template = `<div><p>hello</p><p id='foo'>world</p></div>`
    const ast = parse(template)
    transform(ast)

    const code = generate(ast.jsNode)

    expect(code).toMatchSnapshot()
  })
})
