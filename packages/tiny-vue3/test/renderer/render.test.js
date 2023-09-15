import { createRenderer } from '../../renderer/renderer'

describe('renderer', () => {
  it('render basic', () => {
    const vnode = {
      type: 'div',
      props: { foo: 'bar' },
      children: 'hello'
    }
    const container = document.createElement('div')
    createRenderer().render(vnode, container)

    expect(container.innerHTML).toBe(`<div>hello</div>`)
  })

  describe('mount', () => {
    it('mount element props', () => {
      const vnode = {
        type: 'div',
        props: { foo: 'bar' },
        children: 'hello'
      }
      const container = document.createElement('div')
      createRenderer().render(vnode, container)

      expect(container.firstChild.foo).toBe(`bar`)
    })

    it('mount element children', () => {
      const vnode = {
        type: 'div',
        props: { foo: 'bar' },
        children: [
          { type: 'p', children: 'hello' },
          { type: 'p', children: 'world' },
        ]
      }
      const container = document.createElement('div')
      createRenderer().render(vnode, container)

      expect(container.innerHTML).toBe(`<div><p>hello</p><p>world</p></div>`)
    })

    it('unmount', () => {
      const vnode = { type: 'div', children: 'hello' }
      const container = document.createElement('div')
      const renderer = createRenderer()

      renderer.render(vnode, container)
      expect(container.innerHTML).toBe(`<div>hello</div>`)
      renderer.render(null, container) // unmount
      expect(container.innerHTML).toBe(``)
    })
  })

  describe('patch', () => {
    it('patch element props', () => {
      const vnode = {
        type: 'div',
        props: { foo: '1', bar: '2', baz: '3' },
        children: ''
      }

      const container = document.createElement('div')
      const renderer = createRenderer()

      renderer.render(vnode, container)
      expect(container.firstChild.foo).toBe(`1`)
      expect(container.firstChild.bar).toBe(`2`)
      expect(container.firstChild.baz).toBe(`3`)

      const vnode2 = {
        type: 'div',
        props: { bar: '20', baz: '3' },
        children: ''
      }

      renderer.render(vnode2, container)
      expect(container.firstChild.foo).toBe(null)
      expect(container.firstChild.bar).toBe('20')
      expect(container.firstChild.baz).toBe('3')
    })

    it('patch children without diff', () => {
      const vnode = {
        type: 'div',
        props: { foo: 'bar' },
        children: [
          { type: 'p', children: 'hello' },
          { type: 'p', children: 'world' },
        ]
      }

      const container = document.createElement('div')
      const renderer = createRenderer()

      renderer.render(vnode, container)

      const vnode2 = {
        type: 'div',
        props: { foo: 'bar' },
        children: 'bar' // 卸载 p 节点，渲染 bar 文本
      }

      renderer.render(vnode2, container)

      expect(container.innerHTML).toBe(`<div>bar</div>`)
    })

    it('diff', () => {
      const vnode = {
        type: 'div',
        props: { foo: 'bar' },
        children: [
          { type: 'p', key: 'A', children: 'A' },
          { type: 'p', key: 'B', children: 'B' },
          { type: 'p', key: 'C', children: 'C' },
          { type: 'p', key: 'D', children: 'D' },
          { type: 'p', key: 'E', children: 'E' },
          { type: 'p', key: 'F', children: 'F' },
        ]
      }

      const container = document.createElement('div')
      const renderer = createRenderer()

      renderer.render(vnode, container)

      const vnode2 = {
        type: 'div',
        props: { foo: 'bar' },
        children: [
          { type: 'p', key: 'A', children: 'A' },
          { type: 'p', key: 'C', children: 'C' },
          { type: 'p', key: 'D', children: 'D' },
          { type: 'p', key: 'B', children: 'B' },
          { type: 'p', key: 'G', children: 'G' },
          { type: 'p', key: 'F', children: 'F' },
        ]
      }

      renderer.render(vnode2, container)

      expect(container.innerHTML).toMatchSnapshot()
    })

  })
})
