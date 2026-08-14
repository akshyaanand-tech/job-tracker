import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { api } from '../context/AuthContext';
import { getApiErrorMessage } from '../config';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ApplicationForm from '../components/ApplicationForm';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import styles from './Dashboard.module.css';

const STATUS_OPTIONS = ['', 'Applied', 'Interviewing', 'Rejected'];

const emptyStats = { total: 0, applied: 0, interviewing: 0, rejected: 0 };

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [formModal, setFormModal] = useState({ open: false, app: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, app: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;

      const [appsRes, statsRes] = await Promise.all([
        api.get('/api/applications/', { params }),
        api.get('/api/applications/stats/'),
      ]);

      setApplications(appsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load applications. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await api.post('/api/applications/', formData);
      setFormModal({ open: false, app: null });
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add application.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    setSubmitting(true);
    try {
      await api.put(`/api/applications/${formModal.app.id}/`, formData);
      setFormModal({ open: false, app: null });
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update application.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.app) return;
    setSubmitting(true);
    try {
      await api.delete(`/api/applications/${deleteModal.app.id}/`);
      setDeleteModal({ open: false, app: null });
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete application.'));
    } finally {
      setSubmitting(false);
    }
  };

  const statItems = [
    { label: 'Total', value: stats.total },
    { label: 'Applied', value: stats.applied },
    { label: 'Interviewing', value: stats.interviewing },
    { label: 'Rejected', value: stats.rejected },
  ];

  const hasFilters = debouncedSearch || statusFilter;
  const isEmpty = !loading && applications.length === 0 && !hasFilters;
  const noResults = !loading && applications.length === 0 && hasFilters;

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Job Applications</h1>
          <p className={styles.pageSubtitle}>Track and manage your job search in one place.</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search applications"
          />
        </div>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || 'all'} value={s}>
              {s || 'All statuses'}
            </option>
          ))}
        </select>
        <Button onClick={() => setFormModal({ open: true, app: null })}>
          <Plus size={15} />
          Add Application
        </Button>
      </div>

      <div className={styles.stats}>
        {statItems.map((item) => (
          <div key={item.label} className={styles.statCard}>
            <span className={styles.statValue}>{item.value}</span>
            <span className={styles.statLabel}>{item.label}</span>
          </div>
        ))}
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {loading ? (
        <LoadingState message="Loading applications..." />
      ) : isEmpty ? (
        <EmptyState
          title="No applications yet"
          description="Start tracking your job search by adding your first application."
          action={
            <Button onClick={() => setFormModal({ open: true, app: null })}>
              <Plus size={15} />
              Add Application
            </Button>
          }
        />
      ) : noResults ? (
        <EmptyState
          title="No results found"
          description="Try adjusting your search or filter to find what you're looking for."
        />
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Date Applied</th>
                  <th className={styles.actionsCol}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className={styles.companyCell}>{app.company}</td>
                    <td>{app.role}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td className={styles.dateCell}>{formatDate(app.date_applied)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setFormModal({ open: true, app })}
                          aria-label={`Edit ${app.company} application`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.deleteBtn}`}
                          onClick={() => setDeleteModal({ open: true, app })}
                          aria-label={`Delete ${app.company} application`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.cardList}>
            {applications.map((app) => (
              <div key={app.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardCompany}>{app.company}</h3>
                    <p className={styles.cardRole}>{app.role}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className={styles.cardMeta}>
                  <span>Applied {formatDate(app.date_applied)}</span>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => setFormModal({ open: true, app })}
                      aria-label={`Edit ${app.company} application`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.deleteBtn}`}
                      onClick={() => setDeleteModal({ open: true, app })}
                      aria-label={`Delete ${app.company} application`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={formModal.open}
        onClose={() => !submitting && setFormModal({ open: false, app: null })}
        title={formModal.app ? 'Edit Application' : 'Add Application'}
      >
        <ApplicationForm
          initialData={formModal.app ? {
            company: formModal.app.company,
            role: formModal.app.role,
            status: formModal.app.status,
            date_applied: formModal.app.date_applied,
          } : undefined}
          onSubmit={formModal.app ? handleUpdate : handleCreate}
          onCancel={() => setFormModal({ open: false, app: null })}
          submitting={submitting}
        />
      </Modal>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => !submitting && setDeleteModal({ open: false, app: null })}
        title="Delete Application"
      >
        <p className={styles.deleteText}>
          Are you sure you want to delete the application for{' '}
          <strong>{deleteModal.app?.company}</strong>? This action cannot be undone.
        </p>
        <div className={styles.deleteActions}>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ open: false, app: null })}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={submitting}>
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
