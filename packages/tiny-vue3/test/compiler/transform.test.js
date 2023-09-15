import transform from '../../compiler/transform/transform.js'
import { nodeTypes } from '../../compiler/parse/parse.js'

describe('compile:trasnform', () => {
  it('basic transform', () => {
    // <div><p>hello</p><p>world</p></div>
    const ast = {
      type: nodeTypes.Root,
      children: [{
        type: nodeTypes.Element,
        tag: 'div',
        props: [],
        children: [{
          type: nodeTypes.Element,
          tag: 'p',
          props: [{
            type: nodeTypes.Attributes,
            name: 'id',
            value: 'foo'
          }],
          children: [{ type: nodeTypes.Text, content: 'hello' }],
        }, {
          type: nodeTypes.Element,
          tag: 'p',
          props: [],
          children: [{ type: nodeTypes.Text, content: 'world' }]
        }]
      }]
    }

    const jsAST = transform(ast)
    expect(jsAST).toMatchSnapshot()
  })
})
