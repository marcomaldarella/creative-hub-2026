import Link from 'next/link';
import { Fragment } from 'react';
import { Waveform } from './Waveform';
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
  /** intestazione della colonna social */
  socialTitle?: string;
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
  socialTitle,
  copyright,
  legal,
  homeHref = '/',
}: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.cols}>
          <div>
            <div className={styles.brandRow}>
              <Link href={homeHref} className={styles.brand}>
                <Wordmark />
              </Link>
              <Waveform className={styles.wave} />
            </div>
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
            <div key={i} className={styles.col}>
              {group.title && (
                <span className={styles.colTitle}>{group.title}</span>
              )}
              {group.links.map((link) => (
                <FootLink key={`${link.href}-${link.label}`} link={link} />
              ))}
            </div>
          ))}

          {social && social.length > 0 && (
            <div className={styles.col}>
              {socialTitle && (
                <span className={styles.colTitle}>{socialTitle}</span>
              )}
              {social.map((link) => (
                <FootLink key={`${link.href}-${link.label}`} link={link} />
              ))}
            </div>
          )}
        </div>

        <div className={styles.bottom}>
          <span className="mono">{copyright}</span>
          {legal && legal.length > 0 && (
            <span className={styles.legal}>
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

      {/* type gigante croppato al bordo, come le cover del manuale:
          marquee infinito (due metà identiche, loop -50%; due copie per
          metà così il gruppo supera sempre il viewport, niente buchi) */}
      <div className={`display-black ${styles.giant}`} aria-hidden="true">
        <div className={styles.giantTrack}>
          {[0, 1].map((half) => (
            <span key={half} className={styles.giantGroup}>
              <span className={styles.giantWord}>creative hub</span>
              <span className={styles.giantWord}>creative hub</span>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
