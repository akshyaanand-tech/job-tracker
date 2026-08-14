import { Briefcase } from 'lucide-react';
import styles from './EmptyState.module.css';

export default function EmptyState({ title, description, action }) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>
        <Briefcase size={20} strokeWidth={1.5} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
