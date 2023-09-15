import { importHTML } from './import-html/import-html.js'

export async function loadApp(app) {
  const { evaluateScripts } = await importHTML(app.entry + '/')
  const exports = await evaluateScripts()

  // 获取子应用导出的生命周期函数
  app.bootstrap = exports.bootstrap
  app.mount = exports.mount
  app.unmount = exports.unmount

  return app
}
