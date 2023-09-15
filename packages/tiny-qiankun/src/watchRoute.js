export let prevRoute = null
export let nextRoute = window.location.pathname

// 监听路由变化, 路由有两种模式：history 模式和 hash 模式
export const watchRoute = (onRouteChange) => {
  // hash 模式
  // window.onhashchange = () => { }

  // history 模式
  // history.forward, history.back, history.go 用 popState 事件
  window.addEventListener('popstate', () => {
    // popstate 事件触发时，location 已经变化
    prevRoute = nextRoute
    nextRoute = window.location.pathname
    onRouteChange()
  })

  // 添加历史记录用 pushState 事件
  let _pushState = window.history.pushState
  window.history.pushState = (...args) => {
    prevRoute = window.location.pathname
    _pushState.apply(window.history, args)
    nextRoute = window.location.pathname
    onRouteChange()
  }

  // 替换历史记录用 replaceState 事件
  let _replaceState = window.history.replaceState
  window.history.replaceState = (...args) => {
    prevRoute = window.location.pathname
    _replaceState.apply(window.history, args)
    nextRoute = window.location.pathname
    onRouteChange()
  }
}
