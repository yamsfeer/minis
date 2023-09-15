import { runInSandbox } from '../src/sandbox'

describe('sandbox', () => {
  it('snapshot sandbox', () => {
    window.msg = 'out'
    const code = `
      console.log(window.msg)
      window.msg = 'in'
      console.log(window.msg)
    `
    console.log(window.msg)
    runInSandbox(code)
  })
})
