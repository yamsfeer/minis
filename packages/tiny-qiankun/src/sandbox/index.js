import { ProxySandbox } from './proxy'

export const runInSandbox = (code) => {
  const sandbox = new ProxySandbox()

  // 使用Function构造函数创建一个函数，并将沙箱作为参数传递
  const wrappedCode = `(function(sandbox){ ${code} })(sandbox);`

  // 在沙箱环境中执行封装后的代码
  try {
    const wrappedFunction = new Function('sandbox', wrappedCode)
    wrappedFunction(sandbox)
  } catch (error) {
    console.error('Error in sandboxed code:', error)
  }
}
