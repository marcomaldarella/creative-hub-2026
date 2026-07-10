import { Fragment, type ReactNode } from 'react'
import type { PortableTextBlock } from '@portabletext/types'
import { urlFor } from '@/lib/sanity/image'
import styles from './MagazinePortable.module.css'

/* ---------- tipi interni (shape runtime dei block Sanity) ---------- */

type PtSpan = {
  _type?: string
  _key?: string
  text?: string
  marks?: string[]
}

type PtMarkDef = {
  _key: string
  _type: string
  href?: string
}

type PtNode = {
  _type: string
  _key?: string
  style?: string
  listItem?: 'bullet' | 'number' | string
  level?: number
  children?: PtSpan[]
  markDefs?: PtMarkDef[]
  asset?: { _ref: string; _type: 'reference' }
  alt?: string
}

export type MagazinePortableProps = {
  value: PortableTextBlock[] | undefined
  className?: string
}

/* ---------- span: testo + marks annidati ---------- */

function renderText(text: string): ReactNode {
  const lines = text.split('\n')
  if (lines.length === 1) return text
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ))
}

function renderSpan(span: PtSpan, markDefs: PtMarkDef[], key: string): ReactNode {
  let node: ReactNode = renderText(span.text ?? '')

  for (const mark of span.marks ?? []) {
    switch (mark) {
      case 'strong':
        node = <strong>{node}</strong>
        break
      case 'em':
        node = <em>{node}</em>
        break
      case 'underline':
        node = <u>{node}</u>
        break
      case 'strike-through':
        node = <s>{node}</s>
        break
      case 'code':
        node = <code className={styles.code}>{node}</code>
        break
      default: {
        const def = markDefs.find((d) => d._key === mark)
        if (def?._type === 'link' && typeof def.href === 'string') {
          const external = /^https?:\/\//.test(def.href)
          node = (
            <a
              href={def.href}
              className={styles.link}
              {...(external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {node}
            </a>
          )
        }
      }
    }
  }

  return <Fragment key={key}>{node}</Fragment>
}

function renderChildren(block: PtNode): ReactNode {
  const markDefs = block.markDefs ?? []
  return (block.children ?? []).map((span, i) =>
    renderSpan(span, markDefs, span._key ?? String(i))
  )
}

/* ---------- block ---------- */

function renderBlock(block: PtNode, key: string): ReactNode {
  switch (block.style) {
    case 'h2':
      return (
        <h2 key={key} className={styles.h2}>
          {renderChildren(block)}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={key} className={styles.h3}>
          {renderChildren(block)}
        </h3>
      )
    case 'h4':
      return (
        <h4 key={key} className={styles.h4}>
          {renderChildren(block)}
        </h4>
      )
    case 'blockquote':
      return (
        <blockquote key={key} className={styles.blockquote}>
          {renderChildren(block)}
        </blockquote>
      )
    default:
      return (
        <p key={key} className={styles.p}>
          {renderChildren(block)}
        </p>
      )
  }
}

function renderImage(block: PtNode, key: string): ReactNode {
  if (!block.asset) return null
  const src = urlFor(block as Parameters<typeof urlFor>[0])
    .width(1400)
    .fit('max')
    .url()
  return (
    <figure key={key} className={styles.figure}>
      <img src={src} alt={block.alt ?? ''} loading="lazy" className={styles.figureImg} />
      {block.alt && (
        <figcaption className={`mono ${styles.figcaption}`}>{block.alt}</figcaption>
      )}
    </figure>
  )
}

/**
 * Renderer manuale del portable text per il magazine
 * (block normal/h2/h3/h4/blockquote, liste, strong/em/link/code, image).
 * Nessuna dipendenza di rendering esterna.
 */
export function MagazinePortable({ value, className }: MagazinePortableProps) {
  if (!value || value.length === 0) return null
  const nodes = value as unknown as PtNode[]

  const out: ReactNode[] = []
  let list: { type: string; items: ReactNode[]; key: string } | null = null

  const flushList = () => {
    if (!list) return
    const items = list.items
    out.push(
      list.type === 'number' ? (
        <ol key={list.key} className={styles.list}>
          {items}
        </ol>
      ) : (
        <ul key={list.key} className={styles.list}>
          {items}
        </ul>
      )
    )
    list = null
  }

  nodes.forEach((node, i) => {
    const key = node._key ?? String(i)

    if (node._type === 'image') {
      flushList()
      out.push(renderImage(node, key))
      return
    }

    if (node._type !== 'block') return

    if (node.listItem) {
      if (!list || list.type !== node.listItem) {
        flushList()
        list = { type: node.listItem, items: [], key: `list-${key}` }
      }
      list.items.push(
        <li key={key} className={styles.listItem}>
          {renderChildren(node)}
        </li>
      )
      return
    }

    flushList()
    out.push(renderBlock(node, key))
  })

  flushList()

  return (
    <div className={[styles.portable, className].filter(Boolean).join(' ')}>
      {out}
    </div>
  )
}
