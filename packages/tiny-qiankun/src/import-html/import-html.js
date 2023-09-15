import { runInSandbox } from '../sandbox'

const fetchResource = (url) => fetch(url).then(res => res.text())

export const importHTML = async (url) => {
  const html = await fetchResource(url)
  const template = document.createElement('div')
  template.innerHTML = html

  // 找出所有 script 标签，如果是外链，则继续请求
  function getExternalScripts() {
    const scripts = Array.from(template.querySelectorAll('script'))

    return Promise.all(scripts.map(script => {
      const src = script.getAttribute('src')
      if (src) {
        return fetchResource(
          src.startsWith('http') ? src : `${url}${src}`
        )
      } else {
        return Promise.resolve(script.innerHTML)
      }
    }))
  }

  /* umd 打包格式
    (function(global2, factory) {
      typeof exports === "object" && typeof module !== "undefined"
        ? factory(exports)
        : typeof define === "function" && define.amd
          ? define(["exports"], factory)
          : (global2 = typeof globalThis !== "undefined"
            ? globalThis
            : global2 || self,
              factory(global2["app-vue"] = {})
            );
    })(this, function(exports2) {
      exports2.bootstrap = bootstrap;
      exports2.mount = mount;
      exports2.unmount = unmount;
    }) */
  async function evaluateScripts(globalContext) {
    const scripts = await getExternalScripts()

    // 模拟 cjs 模块，子应用会在 exports 对象上导出函数
    // const module = { exports: {} }
    // const exports = module.exports
    // scripts.forEach(code => eval(code))
    // return module.exports

    scripts.forEach(code => runInSandbox(code))
  }

  return {
    template,
    getExternalScripts,
    evaluateScripts
  }
}
