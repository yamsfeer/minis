const css = require('css')

let rules = []

// 根据 element 的 parent 属性找到全部祖先
function traceAncestor(element) {
  let ancestors = []
  while (element.parent) {
    ancestors.push(element.parent)
    element = element.parent
  }
  return ancestors
}

// 判断 element 和 简单选择器是否匹配
// 比如 <div class="foo"> 和 .foo
function match(element, selector) {
  if (!element.attributes || !selector)
    return false
  let selectorType = selector.charAt(0)
  let attrs = element.attributes

  if (selectorType === '#') {
    let [attr] = attrs.filter(attr => attr.name === 'id')
    return attr && attr.value === selector.replace('#', '')
  } else if (selectorType === '.') {
    let [attr] = attrs.filter(attr => attr.name === 'class')
    return attr && attr.value === selector.replace('.', '')
  } else {
    // 标签选择器
    return element.tagName === selector
  }
}

function setElementRule(element, rule) {
  let { computedStyle } = element
  let [selector] = rule.selectors

  for (const decl of rule.declarations) {
    let { property: prop, value } = decl
    if (!computedStyle[prop])
      computedStyle[prop] = {} // 设置为对象，后面还要存储 css 规则的优先级

    /* 检查 css 规则优先级
       如果 computedStyle 中已有规则且有优先级，更新为优先级较大者 */
    let spec = compareSpec(computedStyle[prop].specificity, specificity(selector))
    computedStyle[prop].value = value
    computedStyle[prop].specificity = spec
  }
}

// 计算选择器的优先级，返回一个四元组
function specificity(selector) {
  let spec = [0, 0, 0, 0]
  let parts = selector = selector.split(' ')

  for (const part of parts) {
    if (part.startsWith('#'))
      spec[1] ++
    else if (part.startsWith('#'))
      spec[2]++
    else
      spec[3]++
  }

  return spec
}

// 比较两个优先级四元组，返回优先级较大者
function compareSpec(spec1, spec2) {
  if (!spec1) return spec2
  if (!spec2) return spec1

  for (let i = 0; i < spec1.length; i++) {
    if (spec1[i] > spec2[i])
      return spec1
  }
  return spec2
}

module.exports = {
  collectCssRule(rawCss) {
    let ast = css.parse(rawCss)
    rules.push(...ast.stylesheet.rules)
  },
  computeCss(element) {
    if (!element.computedStyle)
      element.computedStyle = {}

    let ancestors = traceAncestor(element)
    let matched = false

    for (let rule of rules) {
      // body div img => [img, div, body]
      // 暂不考虑逗号分隔的多选择器的情况
      let selector = rule.selectors[0].split(' ').reverse()

      // 第一个选择器必须和当前 element 匹配，否则整个 selector 不可能匹配 element
      if (!match(element, selector[0]))
        continue


      // TODO：在没有父选择器的情况下会出错，比如 .flex 而不是 body .flex
      let p = 1
      for (const acst of ancestors) {
        if (match(acst, selector[p]))
          p++
      }

      matched = p >= selector.length
      if (matched) {
        // 如果选择器匹配，将 css 规则加入 element 对象中
        setElementRule(element, rule)
      }

    }
  }
}
