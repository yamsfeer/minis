import createCompiler from './compiler.js'
import applyWebpackOptions from './webpackOptionsApply.js'

function normalizeOptions(options) {
  return options
}

function createCompiler(options) {
  // 创建 compiler
  const compiler = new Compiler(options)
  // 应用 webpack 配置提供的插件
  options.plugins.forEach(plugin => {
    if (typeof plugin === 'function') { // 用函数提供的插件
      plugin.call(compiler, compiler)
    } else {
      plugin.apply(compiler)
    }
  })

  // 挂载 webpack 内置插件，或根据用户配置挂载相关插件
  applyWebpackOptions(options, compiler)

  return compiler
}

export default (options) => {
  // normalize options
  const webpackOptions = normalizeOptions(options)
  // create compiler
  const compiler = createCompiler(webpackOptions)

  return compiler
}
