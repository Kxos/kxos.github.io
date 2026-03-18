/**
 * Bottone riutilizzabile con variante primary (pink) e secondary (cyan).
 */

import styles from './Button.module.css'

/**
 * @param {{ variant?: 'primary'|'secondary', href?: string, download?: boolean, children: React.ReactNode } & React.ButtonHTMLAttributes} props
 */
export default function Button({ variant = 'primary', href, download, children, className = '', ...props }) {
  const cls = [styles.btn, styles[variant], className].filter(Boolean).join(' ')

  if (href) {
    return (
      <a href={href} download={download} className={cls}>
        <span>{children}</span>
      </a>
    )
  }

  return (
    <button className={cls} {...props}>
      <span>{children}</span>
    </button>
  )
}
