import TPromise from './main'
import { describe, test } from 'bun:test'
import { assert } from 'chai'

const noop = () => {}

describe('basic', () => {
  test('new', async () => {
    const promise = new TPromise((resolve, reject) => {
      resolve('resolve')
      reject('reject')
    })

    assert.equal(promise instanceof TPromise, true)
  })

  test('then 获取 resolve 值', async () => {
    await new TPromise(resolve => resolve('resolve'))
      .then(value => assert.equal(value, 'resolve'))
  })

  test('then 获取 reject 值', async () => {
    await new TPromise((resolve, reject) => reject('reject'))
      .then(
        value => assert.equal(value, 'resolve'),
        reason => assert.equal(reason, 'reject'),
      )
  })
})

describe('异步逻辑', () => {
  test('异步 resolve', async () => {
    await new TPromise(resolve => setTimeout(() => resolve('resolve'), 100))
      .then(
        value => assert.equal(value, 'resolve'),
        reason => assert.equal(reason, 'reject'),
      )
  })

  test('异步 reject', async () => {
    await new TPromise((resolve, reject) => setTimeout(() => reject('reject'), 100))
      .then(
        value => assert.equal(value, 'resolve'),
        reason => assert.equal(reason, 'reject'),
      )
  })
})

describe('then', () => {
  test('then 函数添加多个回调', async () => {
    const promise = new TPromise(resolve => {
      setTimeout(() => resolve('resolve'), 100)
    })

    const callbacks = []
    promise.then(value => callbacks.push(value))
    promise.then(value => callbacks.push(value))

    promise.then(() => {
      assert.equal(callbacks.length, 1)
    })
    await promise
  })

  test('then 链式调用返回普通值', async () => {
    await TPromise.resolve(1)
      .then(value => {
        assert.equal(value, 1)
        return 2
      })
      .then(value => {
        assert.equal(value, 2)
      })
  })

  test('then 链式调用返回新 promise', async () => {
    await TPromise.resolve(1)
      .then(value => {
        assert.equal(value, 1)
        return new TPromise(resolve => resolve(2))
      })
      .then(value => {
        assert.equal(value, 2)
        return new TPromise(resolve => setTimeout(() => resolve(3), 100))
      })
      .then(value => assert.equal(value, 3))
  })

  /* test('then 链式调用返回 promise 本身', async () => {
    const promise = await TPromise.resolve()
      .then(() => promise) // Cannot access 'promise' before initialization
      .then(noop, reason => assert.exists(reason))
  }) */
})

describe('捕获错误', () => {
  test('执行器错误', async () => {
    await new TPromise(() => { throw new Error('executor error') })
      .then(noop, reason => assert.exists(reason))
  })

  test('then resolve 执行错误', async () => {
    await new TPromise(resolve => resolve(1))
      .then(() => { throw new Error('then resolve error') })
      .then(noop, reason => assert.exists(reason))
  })

  test('then reject 执行错误', async () => {
    await TPromise.reject(1)
      .then(noop, () => { throw new Error('then reject error') })
      .then(noop, reason => assert.exists(reason))
  })
})

describe('默认处理函数', () => {
  test('默认 fulfill 处理函数', async () => {
    await TPromise.resolve('resolve')
      .then()
      .then()
      .then(
        value => assert.equal(value, 'resolve')
      )
  })
  test('默认 reject 处理函数', async () => {
    await TPromise.reject('reject')
      .then()
      .then()
      .then(
        noop,
        reason => assert.equal(reason, 'reject')
      )
  })
})



/* 以下是非 Promise/A+ 方法 */

describe('TPromise.resolve', () => {
  test('resolve 基本值', async () => {
    await TPromise.resolve(1).then(value => assert.equal(value, 1))
  })

  test('resolve promise', async () => {
    const promise = new TPromise(resolve => resolve(2))
    await TPromise.resolve(promise).then(value => assert.equal(value, 2))
  })
})

describe('TPromise.reject', () => {
  test('reject 基本值', async () => {
    await TPromise.reject(1).then(
      noop,
      value => assert.equal(value, 1)
    )
  })
  test('reject promise', async () => {
    const promise = new TPromise((resolve, reject) => reject(2))
    await TPromise.reject(promise).then(
      noop,
      value => assert.equal(value, 2)
    )
  })
})

describe('TPromise.prototype.finally', () => {
  test('resolve 的 promise 调用回调', async () => {
    await TPromise.resolve(1)
      .finally(() => assert.equal(1, 1))
  })
  test('reject 的 promise 调用回调', async () => {
    await TPromise.reject('reject')
      .finally(() => assert.equal(1, 1))
      .catch(err => assert.equal(err, 'reject'))
  })
})

describe('TPromise.prototype.catch', async () => {
  test('捕获错误', async () => {
    await new TPromise(resolve => { throw new Error('reject') })
      .then(() => { throw new Error('reject') })
      .catch(err => assert.equal(err, 'reject'))
  })
})


describe('TPromise.all', () => {
  let tmp = 'pending'
  const promises = [
    TPromise.resolve(1),
    new TPromise(resolve => setTimeout(() => resolve(2), 100)),
    new TPromise(resolve => setTimeout(() => {
      tmp = 'all resolved'
      resolve(4)
    }, 200)),
    'basic value',
  ]
  test('传入空数组', async () => {
    await TPromise.all([])
      .then(data => assert.equal(data.length, 0))
  })
  test('子 promise 都 resolved => resolve', async () => {
    await TPromise.all(promises)
      .then(() => assert.equal(tmp, 'all resolved'))
  })
  test('子 promise 有任何 rejected => 立即 rejected', async () => {
    await TPromise.all([
      ...promises,
      TPromise.reject('rejected')
    ])
      .then(noop, reason => assert.equal(reason, 'rejected'))
  })
  test('resolve 结果与传入顺序相同', async () => {
    await TPromise.all(promises)
      .then(arr => assert.equal(arr[arr.length - 1], 'basic value'))
  })
})

describe('TPromise.race', () => {
  const promises = [
    TPromise.resolve('first fulfill'),
    new TPromise(resolve => setTimeout(() => resolve(2), 100)),
    'basic value',
  ]

  test('传入空数组', async () => {
    await TPromise.race([])
      .then(data => assert.isUndefined(data))
  })

  test('子 promise fulfill => resolve', async () => {
    await TPromise.race(promises)
      .then(value => assert.equal(value, 'first fulfill'))
  })
  test('子 promise reject => reject', async () => {
    await TPromise.race([
      TPromise.reject('race rejected'),
      ...promises,
    ])
      .then(noop, reason => assert.equal(reason, 'race rejected'))
  })
})

describe('TPromise.any', () => {
  test('传入空数组', async () => {
    await TPromise.any([])
      .then(data => assert.isUndefined(data))
  })
  test('任一个 fulfill => resolve', async () => {
    await TPromise.any([
      TPromise.resolve('first fulfill'),
      new TPromise(resolve => setTimeout(() => resolve(3), 100)),
    ])
      .then(value => assert.equal(value, 'first fulfill'))
  })
  test('所有都 reject => reject', async () => {
    await TPromise.any([
      TPromise.reject(1),
      new TPromise((resolve, reject) => reject(2)),
    ])
      .then(noop, reason => assert.exists(reason))
  })
})

describe('TPromise.allSettled', () => {
  test('传入空数组', async () => {
    await TPromise.allSettled([])
      .then(data => assert.equal(data.length, 0))
  })
  test('子 promise 都 reject => resolve', async () => {
    await TPromise.allSettled([
      new TPromise((resolve, reject) => setTimeout(() => reject('reject1'), 100)),
      TPromise.reject('reject2'),
    ])
      .then(value => {
        assert.equal(value[0].status, 'rejected')
        assert.equal(value[0].reason, 'reject1')
      })
  })
  test('子 promise 都 fulfill 或 reject => resolve', async () => {
    await TPromise.allSettled([
      new TPromise(resolve => setTimeout(() => resolve(2), 100)),
      TPromise.reject('rejected'),
      'basic value',
    ])
      .then(value => assert.equal(value.length, 3))
  })
})
