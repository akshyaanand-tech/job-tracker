import styles from './Input.module.css';

export default function Input({
  label,
  error,
  id,
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input id={inputId} className={`${styles.input} ${error ? styles.error : ''}`} {...props} />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export function Select({ label, error, id, children, className = '', ...props }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <select id={selectId} className={`${styles.input} ${styles.select} ${error ? styles.error : ''}`} {...props}>
        {children}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
