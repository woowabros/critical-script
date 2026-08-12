interface MarkdownNode {
  children?: MarkdownNode[]
  type?: string
  url?: string
}

/**
 * Keeps source links useful on GitHub while removing Markdown extensions from site URLs.
 */
export function stripMarkdownLinkExtensions() {
  return (tree: MarkdownNode): void => {
    visit(tree)
  }
}

function visit(node: MarkdownNode): void {
  if ((node.type === 'link' || node.type === 'definition') && node.url?.startsWith('./')) {
    node.url = node.url.replace(/\.(?:md|mdx)(?=([?#]|$))/, '')
  }

  node.children?.forEach(visit)
}
