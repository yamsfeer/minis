import compile from '../../compiler/compiler.js'

describe('vue flow', () => {
  it('should work', () => {
    const template = `<div v-show="isShow">{{foo}}</div>`
    const render = compile(template)

    expect(render).toMatchInlineSnapshot(`
      "function render(){
        return h('div',{v-show:'isShow'},[ctx.foo])
      }"
    `)
  })
})
