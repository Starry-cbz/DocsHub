import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root } from 'mdast'

export const remarkSubSuper: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === null) return

      const value = node.value
      const matches = value.match(/[~^]\{.+?\}|[~^][^\s~^]|[~^]$$.+?$$/g)
      if (!matches) return

      const children = []
      let lastIndex = 0

      matches.forEach(match => {
        const startIndex = value.indexOf(match, lastIndex)
        if (startIndex > lastIndex) {
          children.push({
            type: 'text',
            value: value.slice(lastIndex, startIndex)
          })
        }

        const isSub = match.startsWith('~')
        const tag = isSub ? 'sub' : 'sup'
        let content = ''

        if (match[1] === '{') {
          content = match.slice(2, -1)
        } else if (match[1] === '(') {
          content = match.slice(2, -1)
        } else {
          content = match.slice(1)
        }

        children.push({
          type: 'html',
          value: `<${tag}>${content}</${tag}>`
        })

        lastIndex = startIndex + match.length
      })

      if (lastIndex < value.length) {
        children.push({
          type: 'text',
          value: value.slice(lastIndex)
        })
      }

      parent.children.splice(index, 1, ...children)
    })
  }
}
