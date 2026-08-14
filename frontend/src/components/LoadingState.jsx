import styles from './LoadingState.module.css';

export default function LoadingState({ message = 'Loading...', fullPage = false }) {
  return (
    <div className={`${styles.loading} ${fullPage ? styles.fullPage : ''}`}>
      <div className={styles.spinner} />
      <span className={styles.message}>{message}</span>
    </div>
  );
}
