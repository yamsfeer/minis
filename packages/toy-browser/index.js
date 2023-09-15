const images = require('images')

const Request = require('./src/network/request')
const parser = require('./src/parser')
const render = require('./src/render')

void async function () {
  let req = new Request({
    method: 'GET',
    host: '127.0.0.1',
    port: 8888,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Foo2': 'bar'
    },
    body: {
      name: 'yams'
    }
  })

  let res = await req.send()
  let dom = parser.parseHTML(res.body)

  let div = dom.children[0].children[2].children[0]

  const viewport = images(400, 400)
  render(viewport, div)
  viewport.save('html.jpg')
}()
