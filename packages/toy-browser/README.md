一个浏览器（学习用）。

代码主要包含了 解析 http 响应、解析 html 文本、解析 css 文本、attach dom 和 css、layout、render 这些过程。

一个 http 响应的报文示例：

```
HTTP/1.1 200 OK
X-Foo: bar
Content-Type: text/plain
Date: Sat, 27 Nov 2021 08:40:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

37
<html><head></head><body><div>hello</div></body></html>
0
```

*(注意：chunk-length 是 16 进制)*

由于 http 报文是纯文本的，且当响应是分块传输(*Transfer-Encoding: chunked*)时，可能在任意位置断开。

因此，解析 http 响应需要用到状态机：

<img src="https://tva1.sinaimg.cn/large/008i3skNgy1gwtso89dojj30iu0gj3ze.jpg" style="zoom:70%;" />

解析完 http 响应后，得到 http 文本：

```html
<html>
  <head></head>
  <body>
    <div>hello</div>
  </body>
</html>
```

html 文本转换成 token 的[状态机](https://html.spec.whatwg.org/multipage/parsing.html#tokenization)：*(这里进行了简化)*

<img src="https://tva1.sinaimg.cn/large/008i3skNgy1gwtv7v01omj30lp0bvq3n.jpg" style="zoom:70%;" />

转换成 token 过程中，利用栈构建 dom 树。dom 相关[标准](https://dom.spec.whatwg.org/#nodes)

解析 css 文本使用了 [css 库](https://github.com/reworkcss/css)。解析完 css 文本，得到以下格式样式对象：

```json
{
	"rules": [{
    "selectors": ["body"],
    "declarations": [{
      "property": "background",
      "value": "#eee",
    }]
  }]
}
```

遍历 css 规则和 dom 树，将匹配的规则存入 dom 对象中，重复的规则需要计算优先级。

有了 css 规则的 dom 树需要进行 layout，计算各个元素的位置。代码中以 [flex 布局](https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html) 计算为例。

最后的渲染绘制操作由 [images](https://www.npmjs.com/package/images) 完成。
