// http 协议标准文档：https://datatracker.ietf.org/doc/html/rfc2616

/* 一个http response chunk 的文本格式
HTTP/1.1 200 OK
Content-Type: text/plain
Date: Fri, 26 Nov 2021 06:38:35 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

5
hello
0
*/

// 解析 http 响应文本的状态机 https://tva1.sinaimg.cn/large/008i3skNgy1gwtso89dojj30iu0gj3ze.jpg

class Response {
  constructor() {
    // 初始化状态机状态
    this.STATUS_LINE = Symbol('STATUS_LINE')
    this.STATUS_LINE_END = Symbol('STATUS_LINE_END')

    this.HEADER_NAME = Symbol('HEADER_NAME')
    this.HEADER_NAME_END = Symbol('HEADER_NAME_END')
    this.HEADER_VALUE = Symbol('HEADER_VALUE')
    this.HEADER_VALUE_END = Symbol('HEADER_VALUE_END')
    this.HEADER_BLOCK_END = Symbol('HEADER_BLOCK_END')

    this.BODY_CHUNK = Symbol('BODY_CHUNK')

    this.current = this.STATUS_LINE

    // 解析结果
    this.statusLine = ''

    this.headerName = ''
    this.headerValue = ''
    this.headers = {}

    this.bodyParser = null
    this.body = {}
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s-\S]+)/)
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.bodyText
    }
  }

  // 接收 buffer 转成的字符串
  parse(str) {
    for (const c of str) {
      this.parseChar(c)
    }
  }
  parseChar(c) {
    const CR = '\r'
    const LF = '\n'
    const COLON = ':'
    const SPACE = ' '

    switch (this.current) {
      case this.STATUS_LINE:
        c === CR
          ? this.current = this.STATUS_LINE_END
          : this.statusLine += c
        break
      case this.STATUS_LINE_END:
        if (c === LF) {
          this.current = this.HEADER_NAME
        }
        break
      case this.HEADER_NAME:
        if (c === COLON) {
          this.current = this.HEADER_NAME_END
        } else if (c === CR) {
          this.current = this.HEADER_BLOCK_END
        } else {
          this.headerName += c
        }
        break
      case this.HEADER_NAME_END:
        this.current = this.HEADER_VALUE
        break
      case this.HEADER_VALUE:
        if (c === CR) {
          this.current = this.HEADER_VALUE_END
          this.headers[this.headerName] = this.headerValue
          this.headerName = ''
          this.headerValue = ''
        } else {
          this.headerValue += c
        }
        break
      case this.HEADER_VALUE_END:
        this.current = this.HEADER_NAME
        break
      case this.HEADER_BLOCK_END:
        this.current = this.BODY_CHUNK
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParser = new ChunkBodyParser()
        }
        break
      case this.BODY_CHUNK:
        this.bodyParser.parse(c)
        break

      default:
        break
    }
  }
}

// Transfer-Encoding: 'chunked'
// 分块传输 body 时的解析
class ChunkBodyParser {
  constructor() {
    this.CHUNK_LEN = Symbol('CHUNK_LEN')
    this.CHUNK_LEN_END = Symbol('CHUNK_LEN_END')

    this.CHUNK_BODY = Symbol('CHUNK_BODY')
    this.CHUNK_BODY_END = Symbol('CHUNK_BODY_END')

    this.BODY_FINISHED = Symbol('BODY_FINISHED')

    this.current = this.CHUNK_LEN
    this.length = 0
    this.isFinished = false
    this.bodyText = ''
  }
  parse(c) {
    const CR = '\r'
    const LF = '\n'

    switch (this.current) {
      case this.CHUNK_LEN:
        c === CR
          ? this.current = this.CHUNK_LEN_END
          // 注意 chunk-length 是16进制数
          : this.length = this.length * 16 + parseInt(c, 16)
        break
      case this.CHUNK_LEN_END:
        this.current = this.CHUNK_BODY

        // chunk 长度为 0 说明整个 body 分析完成
        if (this.length === 0) {
          this.isFinished = true
          this.current = this.BODY_FINISHED
        }
        break
      case this.CHUNK_BODY:
        this.bodyText += c
        this.length--
        if (this.length === 0) {
          // 当前 chunk 读取完，和下一个 chunk 间还有一个 \r\n
          this.current = this.CHUNK_BODY_END
        }
        break
      case this.CHUNK_BODY_END:
        c === CR
          ? this.current = this.CHUNK_BODY_END
          : this.current = this.CHUNK_LEN
        break
      default:
        break
    }
  }
}

module.exports = Response
