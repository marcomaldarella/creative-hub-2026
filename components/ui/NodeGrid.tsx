import Link from 'next/link';
import type { CSSProperties } from 'react';
import { RevealGroup } from './Reveal';
import styles from './NodeGrid.module.css';

export type NodeItem = {
  label: string;
  title: string;
  text: string;
  href: string;
};

export type NodeGridProps = {
  nodes: NodeItem[];
  className?: string;
};

/**
 * La griglia dei sei nodi: bordi collassati, celle con label mono,
 * freccia ↙ azzurra che appare e ruota on-hover, reveal a cascata.
 */
export function NodeGrid({ nodes, className }: NodeGridProps) {
  return (
    <RevealGroup
      className={className ? `${styles.grid} ${className}` : styles.grid}
    >
      {nodes.map((node, i) => (
        <Link
          key={`${node.href}-${i}`}
          href={node.href}
          className={`rv ${styles.nodo}`}
          style={{ '--rvd': `${i * 60}ms` } as CSSProperties}
        >
          <span className={`mono ${styles.label}`}>{node.label}</span>
          <h3 className={styles.title}>{node.title}</h3>
          <p className={styles.text}>{node.text}</p>
          <span className={styles.arrow} aria-hidden="true">
            ↙
          </span>
        </Link>
      ))}
    </RevealGroup>
  );
}
