import tokenize from '../../compiler/parse/tokenize.js'
import analyse from '../../compiler/parse/analyze.js'
import parse from '../../compiler/parse/parse.js'

describe('compiler:basic parse', () => {
  it('basic tokenize for tag', () => {
    const template = `<div><p>hello</p></div>`
    const tokens = tokenize(template)

    expect(tokens).toMatchSnapshot()
  })
  it('basic analyse', () => {
    const template = `<div>
      <p>hello</p>
      <p>world</p>
    </div>`
    const tokens = tokenize(template)
    const ast = analyse(tokens)

    expect(ast).toMatchSnapshot()
  })
})

describe('compiler:parse', () => {
  it('complete parse', () => {
    // 一开始的空格换行？？
    // 没有 value 的 attribute ？？ disabled 出错
    // 每次 parseChildren 之前的空格换行怎么处理
    const template = `<div foo="foo" bar='bar' baz=foo @click="handleClick">
        <p :title="title" v-show="isShow">
          hello {{ data }}
        </p>
      </div>
    `
    const ast = parse(template)
    expect(ast).toMatchSnapshot()
  })
})
