const net = require('net');
const Response = require('./response')

class Request {
  constructor(options) {
    // method path host port headers
    let {
      method,
      path = '/',
      host = '127.0.0.1',
      port = 80,
      headers = {},
      body = {},
    } = options

    this.method = method
    this.path = path
    this.host = host
    this.port = port
    this.headers = headers
    this.body = body

    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/json'
    }

    // 暂支持 application/json 和 application/x-www-form-urlencoded 两种类型
    // MIME 类型 https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types
    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body)
    } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      // 转成 key=value& 形式字符串
      this.bodyText = Object.keys(this.body)
        .map(key => `${key}=${encodeURIComponent(this.body[key])}`)
        .join('&')
    }
    this.headers['Content-Length'] = this.bodyText.length
  }

  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\n\r')}
\r
${this.bodyText}`
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      let parser = new Response()
      if (connection) {
        connection.write(this.toString())
      } else {
        connection = net.createConnection({
          host: this.host,
          port: this.port
        }, () => {
          connection.write(this.toString())
        });
      }
      connection.on('data', data => {
        parser.parse(data.toString()) // data 通常是个 Buffer
        if (parser.isFinished)
          resolve(parser.response)
        connection.end()
      });
      connection.on('error', err => {
        console.error('disconnected from server')
        reject(err)
      });
    })

  }
}

module.exports = Request
