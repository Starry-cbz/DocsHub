import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Root, Image } from 'mdast'

export const remarkImageDimensions: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'image', (node: Image) => {
      const { url = '' } = node
      
      // Handle image dimensions (=WxH format)
      const dimensionsMatch = url.match(/=(\d+)?x(\d+)?$/)
      if (dimensionsMatch) {
        const [full, width, height] = dimensionsMatch
        node.url = url.replace(full, '')
        if (width) node.data = { ...node.data, hProperties: { ...node.data?.hProperties, width } }
        if (height) node.data = { ...node.data, hProperties: { ...node.data?.hProperties, height } }
      }

      // Handle image alignment (#pic_center, #pic_right)
      const alignMatch = url.match(/#pic_(center|right)(?:=(\d+)?x(\d+)?)?$/)
      if (alignMatch) {
        const [full, align, width, height] = alignMatch
        node.url = url.replace(full, '')
        
        // Add alignment class
        const className = align === 'center' ? 'mx-auto block' : 'ml-auto block'
        node.data = {
          ...node.data,
          hProperties: {
            ...node.data?.hProperties,
            className,
            width: width || node.data?.hProperties?.width,
            height: height || node.data?.hProperties?.height
          }
        }
      }
    })
  }
}

