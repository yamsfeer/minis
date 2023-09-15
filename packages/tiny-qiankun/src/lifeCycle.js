export async function bootstrap(app) {
  app.bootstrap && await app.bootstrap() // app 的钩子都是返回 promise
}

export async function mount(app) {
  const props = {
    container: document.querySelector(app.container)
  }
  // 将主应用挂载子应用的 dom 节点传给子应用
  app.mount && await app.mount(props)
}
export async function unmount(app) {
  const props = {
    container: document.querySelector(app.container)
  }
  app.unmount && await app.unmount(props)
}
