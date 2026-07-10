import type { ReactNode } from 'react'
import type { PortableTextBlock } from '@portabletext/types'
import { urlFor } from '@/lib/sanity/image'
import styles from './PortableBlocks.module.css'

/* ---------- tipi minimi (accesso difensivo ai dati Sanity) ---------- */

type Span = {
  _key?: string
  _type?: string
  text?: string
  marks?: string[]
}

type MarkDef = {
  _key: string
  _type: string
  href?: string
}

type Block = {
  _key?: string
  _type?: string
  style?: string
  listItem?: string
  children?: Span[]
  markDefs?: MarkDef[]
  // per i blocchi image inline
  asset?: { _ref?: string }
  alt?: string
}

/* ---------- span con marks ---------- */

function renderSpan(span: Span, markDefs: MarkDef[], key: string): ReactNode {
  let node: ReactNode = span.text ?? ''
  for (const mark of span.marks ?? []) {
    if (mark === 'strong') {
      node = <strong>{node}</strong>
    } else if (mark === 'em') {
      node = <em>{node}</em>
    } else if (mark === 'code') {
      node = <code>{node}</code>
    } else {
      const def = markDefs.find((d) => d._key === mark)
      if (def?._type === 'link' && def.href) {
        node = (
          <a href={def.href} target="_blank" rel="noopener noreferrer">
            {node}
          </a>
        )
      }
    }
  }
  return <span key={key}>{node}</span>
}

function renderChildren(block: Block): ReactNode {
  const defs = block.markDefs ?? []
  return (block.children ?? []).map((span, i) =>
    renderSpan(span, defs, span._key ?? String(i))
  )
}

/* ---------- blocco singolo ---------- */

function renderBlock(block: Block, key: string): ReactNode {
  if (block._type === 'image') {
    if (!block.asset?._ref) return null
    return (
      <img
        key={key}
        src={urlFor(block as never).width(1600).url()}
        alt={block.alt ?? ''}
        loading="lazy"
        className={styles.image}
      />
    )
  }

  if (block._type !== 'block') return null

  const children = renderChildren(block)

  switch (block.style) {
    case 'h2':
      return <h2 key={key}>{children}</h2>
    case 'h3':
      return <h3 key={key}>{children}</h3>
    case 'h4':
      return <h4 key={key}>{children}</h4>
    case 'blockquote':
      return <blockquote key={key}>{children}</blockquote>
    default:
      return <p key={key}>{children}</p>
  }
}

export type PortableBlocksProps = {
  value?: PortableTextBlock[] | null
  className?: string
}

/**
 * Renderer minimale per portable text: block (normal/h2/h3/h4/blockquote),
 * liste bullet/number, marks strong/em/code/link, immagini inline.
 * Nessuna dipendenza extra.
 */
export function PortableBlocks({ value, className }: PortableBlocksProps) {
  if (!value || value.length === 0) return null

  const blocks = value as unknown as Block[]
  const out: ReactNode[] = []
  let list: { type: string; items: ReactNode[] } | null = null

  const flushList = () => {
    if (!list) return
    const items = list.items
    out.push(
      list.type === 'number' ? (
        <ol key={`list-${out.length}`}>{items}</ol>
      ) : (
        <ul key={`list-${out.length}`}>{items}</ul>
      )
    )
    list = null
  }

  blocks.forEach((block, i) => {
    const key = block._key ?? String(i)
    if (block._type === 'block' && block.listItem) {
      if (!list || list.type !== block.listItem) {
        flushList()
        list = { type: block.listItem, items: [] }
      }
      list.items.push(<li key={key}>{renderChildren(block)}</li>)
      return
    }
    flushList()
    out.push(renderBlock(block, key))
  })
  flushList()

  return (
    <div className={className ? `${styles.blocks} ${className}` : styles.blocks}>
      {out}
    </div>
  )
}
