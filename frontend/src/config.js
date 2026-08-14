export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error.response) {
    return 'Unable to connect to the server. Please check your connection and try again.';
  }
  const data = error.response.data;
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data?.non_field_errors?.[0]) return data.non_field_errors[0];
  const firstField = Object.values(data || {}).flat()[0];
  if (typeof firstField === 'string') return firstField;
  return fallback;
}
