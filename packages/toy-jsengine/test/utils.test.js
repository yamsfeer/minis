import { assert } from 'chai'
import { createPeekIterator } from '../src/utils/peekIterator.js'

describe('peekIterator', () => {
  it('should return a iterator', () => {
    const it = createPeekIterator([1, 2])

    assert.equal(typeof it.next, 'function')
  })

  it('peek', () => {
    const it = createPeekIterator([1, 2, 3])
    assert.equal(it.peek(), 1)
    assert.equal(it.peek(), 1)
  })

  it('next', () => {
    const it = createPeekIterator([1, 2, 3])
    assert.equal(it.next(), 1)
    assert.equal(it.next(), 2)
    assert.equal(it.next(), 3)
  })
  it('hasNext', () => {
    const it = createPeekIterator([1, 2])
    assert.equal(it.hasNext(), true)
    assert.equal(it.next(), 1)
    assert.equal(it.next(), 2)
    assert.equal(it.hasNext(), true) // 1, 2 迭代完，但仍未 done

    assert.equal(it.next(), undefined)
    assert.equal(it.hasNext(), false)
  })
  it('putBack', () => {
    const it = createPeekIterator([1, 2, 3])
    it.next()
    it.putBack()
    assert.equal(it.peek(), 1)

    it.next()
    it.next()

    it.putBack()
    it.putBack()

    assert.equal(it.peek(), 1)
  })
})
