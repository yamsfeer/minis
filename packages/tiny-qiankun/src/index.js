import { watchRoute, nextRoute, prevRoute } from './watchRoute.js'
import { loadApp } from './loadApp.js'
import { bootstrap, mount, unmount } from './lifeCycle.js'

window.__POWERED_BY_QIANKUN__ = true

let apps

export const registerMicroApps = (microApps) => {
  apps = microApps
}

const matchAppByRoute = (apps, route) => {
  return apps.find(app => route.startsWith(app.activeRule))
}

const onRouteChange = async () => {
  // 如果存在上一个应用，先销毁
  if (prevRoute && matchAppByRoute(apps, prevRoute)) {
    unmount(prevApp)
  }

  const app = matchAppByRoute(apps, nextRoute)

  if (!app) {
    return
  }

  /* 加载 app */
  await loadApp(app) // loadApp 会在 app 上挂载 3 个钩子函数
  /* 挂载 app */
  await bootstrap(app)
  await mount(app)

  // 设置 public path，提供子应用 /img/photo.png 这类地址前缀
  // 每次切换 app 都需要设置
  window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ = app.entry + '/'
}

export const start = () => {
  // 劫持路由变化
  watchRoute(onRouteChange)
  onRouteChange() // 最开始加载时，手动调用一次
}
