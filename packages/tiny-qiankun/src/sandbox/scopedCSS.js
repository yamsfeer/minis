export const processStyleRule = (rule, prefix) => {
  const { selectorText, cssText } = rule
  const prefixedSelecor = selectorText
    .split(',')
    .map(item => `${prefix} ${item}`)
    .join(',')

  return cssText.replace(selectorText, prefixedSelecor)
}

export const procssStyleSheets = (styleElement, prefix) => {
  const rules = Array.from(styleElement.sheet.CSSRules)

  const cssText = rules.reduce((cssText, rule) => {
    if (rule instanceof CSSStyleRule) {
      return `${cssText}${processStyleRule(rule, prefix)}`
    }
    else if (rule instanceof CSSImportRule) { }
    else if (rule instanceof CSSMediaRule) { }
    else {
      return `${cssText}${rule.cssText}`
    }
  }, '')

  return cssText
}

//
export const scopedCSS = (container, prefix) => {
  // 设置子应用容器的属性，[data-qiankun-name] div { ... }
  container.setAttribute(prefix, 1)

  // 获取所有 style 标签，对所有选择器添加 [data-qiankun-name] 前缀
  // 不支持 link 标签引入的 css 文件
  const elements = Array.from(container.querySelectorAll('style'))
  elements.forEach(element => procssStyleSheets(element, prefix))
}
