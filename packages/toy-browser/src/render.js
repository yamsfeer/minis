const images = require('images')

function render(viewport, element) {
  let style = element.style
  if (style) {
    let img = images(style.width, style.height)

    if (style['background-color']) {
      let color = style['background-color'] || 'rgb(0,0,0)'
      color.match(/rgb\((\d+),(\d+),(\d+)\)/)

      img.fill(Number(RegExp.$1), Number(RegExp.$1), Number(RegExp.$3))

      viewport.draw(img, style.left || 0, style.top || 0)
    }
  }

  if (element.children)
    for (const ele of element.children) {
      render(viewport, ele)
    }
}

module.exports = render
