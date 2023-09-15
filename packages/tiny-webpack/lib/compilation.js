export default class Compilation {
  constructor(compiler, params) { }

  addEntry(entry, options = { name: 'main' }) {
    let entryData

    this.hooks.addEntry.call(entry, options)

    this.addModuleTree(
      {
        context,
        dependency: entry
      },
      (err, module) => {
        if (err) {
          this.hooks.failedEntry.call(entry, options, err);
          return callback(err);
        }
        this.hooks.succeedEntry.call(entry, options, module);
        return callback(null, module);
      }
    );
  }

  addModuleTree() {
    const Dep = dependency.constructor
    const moduleFactory = this.dependencyFactories.get(Dep)

    this.handleModuleCreation(
      {
        factory: moduleFactory,
        dependencies: [dependency],
        originModule: null,
        contextInfo,
        context
      },
      (err, result) => {
        if (err && this.bail) {
          callback(err);
          this.buildQueue.stop();
          this.rebuildQueue.stop();
          this.processDependenciesQueue.stop();
          this.factorizeQueue.stop();
        } else if (!err && result) {
          callback(null, result);
        } else {
          callback();
        }
      }
    )
  }
  handleModuleCreation() {

  }
}
