import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, getApiErrorMessage } from '../config';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Register() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <LoadingState fullPage message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.username.trim()) nextErrors.username = 'Username is required';
    if (!form.password) nextErrors.password = 'Password is required';
    if (!form.password_confirm) nextErrors.password_confirm = 'Please confirm your password';
    if (form.password && form.password_confirm && form.password !== form.password_confirm) {
      nextErrors.password_confirm = 'Passwords do not match';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/register/`, {
        username: form.username.trim(),
        password: form.password,
        password_confirm: form.password_confirm,
      });
      navigate('/login', {
        state: { message: 'Account created successfully. Please sign in.' },
      });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        Object.entries(data).forEach(([key, value]) => {
          if (Array.isArray(value)) fieldErrors[key] = value[0];
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
      }
      setSubmitError(getApiErrorMessage(err, 'Unable to create account. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Start tracking your job applications with JobTrack.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {submitError && <div className={styles.errorBanner} role="alert">{submitError}</div>}

          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            autoComplete="username"
            disabled={submitting}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
            disabled={submitting}
          />
          <Input
            label="Confirm password"
            name="password_confirm"
            type="password"
            value={form.password_confirm}
            onChange={handleChange}
            error={errors.password_confirm}
            autoComplete="new-password"
            disabled={submitting}
          />

          <Button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
