/* 对 element.computedStyle 预处理，方便计算 */
function preProcessing(element) {
  if (!element.style)
    element.style = {}

  let { style, computedStyle } = element

  for (const prop in computedStyle) {
    style[prop] = computedStyle[prop].value

    if (style[prop].match(/^[0-9\.]+px$/))
      style[prop] = parseInt(style[prop]) // parseInt 会自动忽略 px
  }

  ['width', 'height'].forEach(wh => {
    if (style[wh] === 'auto' || style[wh] === ' ')
      style[wh] = null
  })

  return style
}

/* flex 布局
   标准：https://www.w3.org/TR/css-flexbox-1/
   教程：https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html */

function layout(element) {
  if (!element.computedStyle)
    return

  let style = preProcessing(element)

  // 只支持 flex 布局
  if (style.display !== 'flex')
    return

  let container = element
  let items = container.children.filter(child => child.type === 'element')

  // item 属性： order
  items.sort((a, b) => (a.order || 0) - (b.order || 0))

  // 设置 flex 属性的默认值
  let {
    flexDirection, alignItems, justifyContent,
    flexWrap, alignContent
  } = style

  if (!flexDirection || flexDirection === 'auto')
    style.flexDirection = 'row'
  if (!alignItems || alignItems === 'auto')
    style.alignItems = 'stretch'
  if (!justifyContent || justifyContent === 'auto')
    style.justifyContent = 'flex-start'
  // if (!flexWrap || flexWrap === 'auto')
  //   style.flexWrap = 'nowrap'
  if (!alignContent || alignContent === 'auto')
    style.alignContent = 'stretch'

  let mainSign, mainBase, mainStart, mainSize, mainEnd,
      crossSign, crossBase, crossStart, crossSize, crossEnd

  let { width, height } = style

  if (flexDirection === 'row') {
    mainSize  = 'width'
    mainStart = 'left'
    mainEnd   = 'right'
    mainSign  = +1
    mainBase  = 0

    crossSize  = 'height'
    crossStart = 'top'
    crossEnd   = 'bottom'
  }
  if (flexDirection === 'row-reverse') {
    mainSize  = 'width'
    mainStart = 'right'
    mainEnd   = 'left'
    mainSign  = -1
    mainBase  = width

    crossSize  = 'height'
    crossStart = 'top'
    crossEnd   = 'bottom'
  }
  if (flexDirection === 'column') {
    mainSize  = 'height'
    mainStart = 'top'
    mainEnd   = 'bottom'
    mainSign  = +1
    mainBase  = 0

    crossSize  = 'width'
    crossStart = 'left'
    crossEnd   = 'right'
  }
  if (flexDirection === 'column-reverse') {
    mainSize = 'height'
    mainStart = 'bottom'
    mainEnd = 'top'
    mainSign = -1
    mainBase = height

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }

  if (flexDirection === 'wrap-reverse') {
    // wrap-reverse 交换 cross 轴的起点和终点
    [crossStart, crossEnd] = [crossEnd, crossStart]
    crossSign = -1
  } else {
    crossBase = 0
    crossSign = 1
  }

  // 将项目放入行中
  let flexLine = []
  let flexLines = [flexLine]

  let mainSpace = style[mainSize] // 主轴剩余空间
  let crossSpace = 0 // 交叉轴剩余空间

  for (let item of items) {
    let itemStyle = preProcessing(item)

    if (itemStyle[mainSize] === null)
      itemStyle[mainSize] = 0

    if (!item.flex) { // 如果项目是 flex 布局，则容器一定能容纳
      if (itemStyle[mainSize] > style[mainSize]) // 单个项目宽度大于容器宽度，则缩放项目宽度
        itemStyle[mainSize] = style[mainSize]

      if (mainSpace < itemStyle[mainSize]) { // 当前行剩余空间不足，创建新行

        // 记录当前剩余空间
        flexLine.mainSpace = mainSpace
        flexLine.crossSpace = crossSpace

        // 重置变量
        mainSpace = style[mainSize]
        crossSpace = 0

        // 创建新行
        flexLine = []
        flexLines.push(flexLine)
      }
    }

    // 当前项目放入当前行
    flexLine.push(item)
    mainSpace -= itemStyle[mainSize]
  }

  flexLine.mainSpace = mainSpace
  flexLine.crossSpace = crossSpace
}

module.exports = layout
