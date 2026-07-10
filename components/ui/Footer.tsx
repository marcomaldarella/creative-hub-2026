import Link from 'next/link';
import { Fragment } from 'react';
import { Wordmark } from './Wordmark';
import styles from './Footer.module.css';

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterGroup = {
  title?: string;
  links: FooterLink[];
};

export type FooterProps = {
  /** righe indirizzo/contatti sotto il wordmark */
  contactLines?: string[];
  /** colonne di link */
  groups?: FooterGroup[];
  /** colonna social (external: true per _blank) */
  social?: FooterLink[];
  /** riga bottom */
  copyright: string;
  legal?: FooterLink[];
  /** href del wordmark (default '/') */
  homeHref?: string;
};

function FootLink({ link }: { link: FooterLink }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer">
        {link.label}
      </a>
    );
  }
  return <Link href={link.href}>{link.label}</Link>;
}

export function Footer({
  contactLines,
  groups,
  social,
  copyright,
  legal,
  homeHref = '/',
}: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.cols}>
          <div>
            <Link href={homeHref} className={styles.brand}>
              <Wordmark />
            </Link>
            {contactLines && contactLines.length > 0 && (
              <address className={`mono ${styles.contact}`}>
                {contactLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </address>
            )}
          </div>

          {groups?.map((group, i) => (
            <div key={i} className={`mono ${styles.col}`}>
              {group.title && (
                <span className={styles.colTitle}>{group.title}</span>
              )}
              {group.links.map((link) => (
                <FootLink key={`${link.href}-${link.label}`} link={link} />
              ))}
            </div>
          ))}

          {social && social.length > 0 && (
            <div className={`mono ${styles.col}`}>
              {social.map((link) => (
                <FootLink key={`${link.href}-${link.label}`} link={link} />
              ))}
            </div>
          )}
        </div>

        <div className={styles.bottom}>
          <span className="mono">{copyright}</span>
          {legal && legal.length > 0 && (
            <span className={`mono ${styles.legal}`}>
              {legal.map((link, i) => (
                <Fragment key={`${link.href}-${link.label}`}>
                  {i > 0 && <span aria-hidden="true"> · </span>}
                  <FootLink link={link} />
                </Fragment>
              ))}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
