export * from './alphabet.js'
export * from './peekIterator.js'

const bracketMap = new Map([
  ['(', ')'],
  ['[', ']'],
  ['{', '}'],
  ['<', '>'],
])

export const matchBracket = (left, right) => {
  return bracketMap.has(left) && bracketMap.get(left) === right
}

export const matchQuote = (left, right) => {
  return (left === '\'' && left === right) ||
    (left === '"' && left === right)
}
