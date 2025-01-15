import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root } from 'mdast'

export const remarkMarkedText: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || index === null) return

      const value = node.value
      const matches = value.match(/==(.+?)==/g)
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

        children.push({
          type: 'html',
          value: `<mark>${match.slice(2, -2)}</mark>`
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

