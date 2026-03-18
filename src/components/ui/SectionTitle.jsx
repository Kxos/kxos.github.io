/**
 * Titolo di sezione con linea decorativa animata.
 */

import styles from './SectionTitle.module.css'

export default function SectionTitle({ children, align = 'center' }) {
  return (
    <h2 className={`${styles.title} ${styles[align]}`}>
      {children}
    </h2>
  )
}
