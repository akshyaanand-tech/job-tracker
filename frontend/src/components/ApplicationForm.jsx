import { useState } from 'react';
import Button from './Button';
import Input, { Select } from './Input';
import styles from './ApplicationForm.module.css';

const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Rejected'];

const emptyForm = {
  company: '',
  role: '',
  status: 'Applied',
  date_applied: '',
};

export default function ApplicationForm({ initialData, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initialData || emptyForm);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.company.trim()) newErrors.company = 'Company is required';
    if (!form.role.trim()) newErrors.role = 'Role is required';
    if (!form.status) newErrors.status = 'Status is required';
    if (!form.date_applied) newErrors.date_applied = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Company"
        name="company"
        value={form.company}
        onChange={handleChange}
        error={errors.company}
        placeholder="e.g. Stripe"
      />
      <Input
        label="Role"
        name="role"
        value={form.role}
        onChange={handleChange}
        error={errors.role}
        placeholder="e.g. Software Engineer"
      />
      <Select
        label="Status"
        name="status"
        value={form.status}
        onChange={handleChange}
        error={errors.status}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>
      <Input
        label="Date Applied"
        name="date_applied"
        type="date"
        value={form.date_applied}
        onChange={handleChange}
        error={errors.date_applied}
      />
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Application'}
        </Button>
      </div>
    </form>
  );
}
