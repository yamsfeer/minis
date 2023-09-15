import TPromise from './main'

const adapter = {
  pending() {
    const result = {}
    result.promise = new TPromise((resolve, reject) => {
      result.fulfill = resolve
      result.reject = reject
    })
    return result
  }
}

export default adapter
