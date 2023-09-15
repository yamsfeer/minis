// 针对某 entry，为 compilation 和 make 事件添加回调
function singleEntry(compiler, entry, options) {
  compiler.hooks.compilation.tap('EntryPlugin', (compilation, { normalModuleFactory }) => {
    // 设置创建 module 的工厂函数
    compilation.dependencyFactories.set(EntryDependency, normalModuleFactory)
  })

  // const dep = new EntryDependency(entry) // 入口文件的依赖，即入口文件中 import 的模块

  compiler.hooks.make.tapAsync('EntryPlugin', (compilation, callback) => {
    // 开始编译
    compilation.addEntry(entry, dep, options)
  })
}

export default function processEntry(compiler, options) {
  compiler.hooks.entryOption.tap('EntryOptionPlugin', (entry) => {
    if (typeof entry === 'function') {
      // 动态入口
      // dynamicEntry(compiler)
    } else {
      // 多文件入口或单文件入口，这里只考虑单入口
      singleEntry(compiler, entry, options)
    }
    return true
  })
}
