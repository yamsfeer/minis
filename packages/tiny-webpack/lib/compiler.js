const {
  SyncHook,
  SyncBailHook,
  AsyncParallelHook,
  AsyncSeriesHook
} = require('tapable')

import Compilation from './compilation'
import NormalModuleFactory from './NormalModuleFactory'

export default class Compiler {
  constructor(options) {
    this.hooks = Object.freeze({
      initialize: new SyncHook([]),

      shouldEmit: new SyncBailHook(['compilation']),
      done: new AsyncSeriesHook(['stats']),
      afterDone: new SyncHook(['stats']),
      additionalPass: new AsyncSeriesHook([]),
      beforeRun: new AsyncSeriesHook(['compiler']),
      run: new AsyncSeriesHook(['compiler']),
      emit: new AsyncSeriesHook(['compilation']),
      assetEmitted: new AsyncSeriesHook(['file', 'info']),
      afterEmit: new AsyncSeriesHook(['compilation']),

      thisCompilation: new SyncHook(['compilation', 'params']),
      compilation: new SyncHook(['compilation', 'params']),
      normalModuleFactory: new SyncHook(['normalModuleFactory']),
      contextModuleFactory: new SyncHook(['contextModuleFactory']),

      beforeCompile: new AsyncSeriesHook(['params']),
      compile: new SyncHook(['params']),
      make: new AsyncParallelHook(['compilation']),
      finishMake: new AsyncSeriesHook(['compilation']),
      afterCompile: new AsyncSeriesHook(['compilation']),

      readRecords: new AsyncSeriesHook([]),
      emitRecords: new AsyncSeriesHook([]),

      watchRun: new AsyncSeriesHook(['compiler']),
      failed: new SyncHook(['error']),
      invalid: new SyncHook(['filename', 'changeTime']),
      watchClose: new SyncHook([]),
      shutdown: new AsyncSeriesHook([]),
    })

    this.options = options
  }
  run() {
    const onCompiled = (compilation) => {
      this.hooks.shouldEmit.call(compilation)
      this.hooks.done.callAsync(compilation)
      this.emitAssets(compilation)
    }

    const run = async () => {
      await this.hooks.beforeRun.promise(this)
      await this.hooks.run.promise(this)
      const compilation = await this.compile()

      return Promise.resolve().then(() => onCompiled(compilation))
    }

    return run() // 开始编译
  }

  async compile(callback) {
    const params = {
      normalModuleFactory: this.createNormalModuleFactory(),
      // contextModuleFactory: this.createContextModuleFactory()
    }

    await this.hooks.beforeCompile.promise(params)
    await this.hooks.compile.call(params)

    // 创建 compilation
    const compilation = this.newCompilation(params)

    // 在 processEntry 中有 make hook 的监听，它会调用 compilation.addEntry
    await this.hooks.make.promise(compilation)
    await this.hooks.finishMake.promise(compilation)

    await compilation.finish()
    await compilation.seal()

    return this.hooks.afterCompile.promise(compilation)
  }

  newCompilation(params) {
    const compilation = new Compilation(this, params)
    compilation.name = this.name

    this.hooks.thisCompilation.call(compilation, params)
    this.hooks.compilation.call(compilation, params)

    return compilation
  }

  createNormalModuleFactory() {
    const normalModuleFactory = new NormalModuleFactory({
      context: this.options.context,
      fs: this.inputFileSystem,
      options: this.options.module,
    })

    this.hooks.normalModuleFactory.call(normalModuleFactory)

    return normalModuleFactory
  }

  emitAssets(compilation, callback) {

  }
}
