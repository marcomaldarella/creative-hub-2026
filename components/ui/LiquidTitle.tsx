import type { CSSProperties, ElementType, ReactNode } from 'react';
import styles from './LiquidTitle.module.css';

export type LiquidTitleProps = {
  /** righe del titolo (usare <br /> tra le righe) */
  children: ReactNode;
  /** font-size (default var(--fs-hero)) */
  size?: string;
  /** tag da renderizzare (default h1) */
  as?: ElementType;
  className?: string;
};

/**
 * Il titolo hero firma: display-black gigante con la texture liquida
 * animata dentro le lettere (background-clip: text, keyframes 'liquid'
 * 22s alternate — gradient e timing dal reference approvato).
 */
export function LiquidTitle({
  children,
  size,
  as: Tag = 'h1',
  className,
}: LiquidTitleProps) {
  const cls = ['display-black', styles.title, className]
    .filter(Boolean)
    .join(' ');
  const style: CSSProperties | undefined = size ? { fontSize: size } : undefined;

  return (
    <Tag className={cls} style={style}>
      {children}
    </Tag>
  );
}
