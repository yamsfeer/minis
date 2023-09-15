import { createRenderer } from '../../renderer/renderer'
import { mountComponent, patchComponent } from '../../component/component'
import { reactive } from '../../reactivity/reactive'
import { onMounted } from '../../component/lifecycle'

describe('component', () => {
  describe('mount component', () => {

    it('basic render component', () => {
      const Comp = {
        data() {
          return { foo: 'foo' }
        },
        render() {
          return { type: 'div', children: `hello ${this.foo}` }
        }
      }

      const vnode = { type: Comp }

      const renderer = createRenderer()
      const container = document.createElement('div')
      renderer.render(vnode, container)

      expect(container.innerHTML).toBe(`<div>hello foo</div>`)
    })

    it('reactive render', async () => {
      const Comp = {
        data() {
          return { foo: 'foo' }
        },
        render() {
          return { type: 'div', children: `hello ${this.foo}` }
        }
      }

      const vnode = { type: Comp }

      const container = document.createElement('div')
      mountComponent(vnode, container)
      expect(container.innerHTML).toBe(`<div>hello foo</div>`)

      vnode.component.state.foo = 'bar' // 组件实例会挂载到 vnode 上

      // 由于渲染任务是放在微任务队列中的，所以观察 dom 变化需要 nextTick
      // vitest 的异步测试如下，需要在 then 中返回 container.innerHTML，直接 resolve 不行
      await expect(Promise.resolve().then(() => container.innerHTML))
        .resolves.toEqual(`<div>hello bar</div>`)
    })

    it('component lifescycle', () => {
      const Comp = {
        data() {
          return { foo: 'foo', count: 1 }
        },
        render() {
          return { type: 'div', children: `hello ${this.foo}` }
        },
        created() {
          this.count++
        }
      }

      const vnode = { type: Comp }
      const container = document.createElement('div')
      mountComponent(vnode, container)

      expect(vnode.component.state.count).toBe(2)
    })

    it('transfer props to component', () => {
      const Comp = {
        props: { title: String },
        render() {
          return { type: 'div', children: `hello ${this.title}` }
        }
      }

      const vnode = { type: Comp, props: { title: 'foo' } }
      const container = document.createElement('div')
      mountComponent(vnode, container)
      expect(container.innerHTML).toBe(`<div>hello foo</div>`)
    })

  })

  describe('patch component', () => {
    it('should update when props change', async () => {
      const Comp = {
        props: { title: String },
        render() {
          return { type: 'div', children: `hello ${this.title}` }
        }
      }

      const vnode = { type: Comp, props: { title: 'foo' } }

      const container = document.createElement('div')
      mountComponent(vnode, container)
      expect(container.innerHTML).toBe(`<div>hello foo</div>`)

      const vnode2 = { type: Comp, props: { title: 'bar' } }
      // 模拟 patch component
      vnode2.component = vnode.component
      patchComponent(vnode, vnode2, container)

      await expect(Promise.resolve().then(() => container.innerHTML))
        .resolves.toEqual(`<div>hello bar</div>`)
    })
  })

  describe('setup function', () => {
    it('basic', () => {
      const Comp = {
        props: { title: String },
        setup() {
          const foo = reactive({ value: 'foo' })
          return { foo }
        },
        render() {
          return {
            type: 'div', children: `hello ${this.foo.value} ${this.title}`
          }
        }
      }
      const vnode = { type: Comp, props: { title: 'bar' } }

      const container = document.createElement('div')
      mountComponent(vnode, container)

      expect(container.innerHTML).toBe(`<div>hello foo bar</div>`)
    })

    it('emit', () => {
      const Comp = {
        setup(props, setupContext) {
          setupContext.emit('change', 'foo')
          return {}
        },
        render() {
          return { type: 'div', children: `` }
        }
      }
      let value
      const vnode = {
        type: Comp,
        props: {
          onChange(val) {
            value = val
          }
        }
      }

      const container = document.createElement('div')
      mountComponent(vnode, container)

      expect(value).toBe(`foo`)
    })

    it('slots', () => {
      const HomeComponent = {
        render() {
          return { // home vnode
            type: PageComponent,
            children: {
              // slot 函数，会被子组件调用，类似 props
              header() { return { type: 'h1', children: 'title' } },
              body() { return { type: 'div', children: 'content' } },
            }
          }
        }
      }

      const PageComponent = {
        render() {
          return { // page vnode
            type: 'div',
            children: [
              { type: 'header', children: [this.$slots.header()] },
              { type: 'body', children: [this.$slots.body()] },
            ]
          }
        }
      }

      const container = document.createElement('div')
      mountComponent({ type: HomeComponent }, container)

      /* 相当于 home 的模板为
        <template>
          <Page>
            <template #header><h1>title</h1></template>
            <template #body><div>content</div></template>
          </Page>
        </template>
       */
      expect(container.innerHTML).toBe(`<div><header><h1>title</h1></header><body><div>content</div></body></div>`)
    })

    it('setup lifecycle', () => {
      let value = 1

      const Comp = {
        setup() {
          onMounted(() => value++)
          return {}
        },
        render() {
          return { type: 'div', children: null }
        }
      }

      const vnode = { type: Comp }

      const container = document.createElement('div')
      mountComponent(vnode, container)

      expect(value).toBe(2)
    })
  })
})
