const http = require('http')

const server  = http.createServer((req, res) => {
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`<html attr=foo><head><style>
        body { color: red }
        body div { font-size: 14px }
        body .flex { display: flex; background-color: rgb(255,0,0); width: 100px; height: 100px }
        .flex .item { background-color: rgb(0,255,0); width: 100px }
        #pic { width: 100px }
        body #pic { width: 200px }
      </style>
    </head>
    <body>
      <div class="flex">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
      </div>
      <img src="xxx.jpg" id='pic'/>
    </body>
  </html>`)
})

server.listen(8888)
