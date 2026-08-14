import styles from './StatusBadge.module.css';

const statusStyles = {
  Applied: styles.applied,
  Interviewing: styles.interviewing,
  Rejected: styles.rejected,
};

export default function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${statusStyles[status] || ''}`}>
      {status}
    </span>
  );
}
