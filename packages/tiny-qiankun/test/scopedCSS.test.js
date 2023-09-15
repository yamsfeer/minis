import { processStyleRule, procssStyleSheets, scopedCSS} from '../src/sandbox/scopedCSS'

describe('scoped css', () => {
  it('processStyleRule', () => {
    const rule = {
      selectorText: `div p`,
      cssText: `div p { font-size: 20px; }`
    }
    const cssText = processStyleRule(rule, '[data-qiankun]')
    expect(cssText).toBe(`[data-qiankun] div p { font-size: 20px; }`)
  })

  it('procssStyleSheets', () => {
    const styleElement = document.createElement('style')
    styleElement.innerHTML = `
      div p { font-size: 20px }
      h1, h2, div input { font-size: 30px }
    `
    const cssText = procssStyleSheets(styleElement, `[data-qiankun]`)
    expect(cssText).toMatchSnapshot()
  })

  it('scopedCSS', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <style>
        html { font-size: 20px; }
        body div { font-size: 40px; }
      </style>
      <style>
        p, textarea { font-size: 100px; }
        .container { font-size: 200px; }
      </style>
    `

    // happy-dom 无法获取 CSSRules， 即 styleElement.sheet
    // Cannot read properties of null (reading 'CSSRules')
    const cssText = scopedCSS(container, `data-qiankun`)
  })
})
