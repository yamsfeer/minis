export const ptnSpace = /^[\s\t]$/
export const ptnBracket = /^[\(\{\)\}]$/
export const ptnLiteral = /^[_a-zA-Z0-9]$/
export const ptnNumber = /^[0-9]$/
export const ptnStrQuote = /^[\'\"]$/
export const ptnOperator = /^[\*+-/><=&|!^%]$/

export const isSpace = (char) => ptnSpace.test(char)
export const isQuote = (char) => ptnBracket.test(char)
export const isLiteral = (char) => ptnLiteral.test(char)
export const isNumber = (char) => ptnNumber.test(char)
export const isStrQuote = (char) => ptnStrQuote.test(char)
export const isOperator = (char) => ptnOperator.test(char)
