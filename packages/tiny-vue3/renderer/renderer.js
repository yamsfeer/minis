import { patch } from './patch.js'
import { unmount } from './patch.js'

export function createRenderer() {
  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    } else {
      if (container._vnode) {
        unmount(container._vnode)
      }
    }

    container._vnode = vnode
  }

  return {
    render
  }
}
