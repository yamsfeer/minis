let currentInstance = null

export function setCurrentInstance(instance) {
  currentInstance = instance
}

export function onMounted(cb) {
  if (currentInstance) {
    currentInstance.mounted.push(cb)
  } else {
    console.error('mounted 注册失败')
  }
}
