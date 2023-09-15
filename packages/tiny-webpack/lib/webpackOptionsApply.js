import processEntry from './plugins/processEntry'

// 处理 option
export default function applyWebpackOptions(options, compiler) {
  // 根据配置挂载插件
  // if (options.externals) new ExternalsPlugin().apply(compiler)

  // 挂载内置插件
  // new ChunkPrefetchPreloadPlugin().apply(compiler)

  // 添加 entry 相关事件处理，相当于 addEventListener
  processEntry(compiler, options)
  // 触发 entry 事件，开始处理入口文件，相当于 trigger
  compiler.hooks.entryOption.call(options.entry)
}
