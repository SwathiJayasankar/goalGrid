export const categories = {
  study: { label: 'Study', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
  health: { label: 'Health', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.2)' },
  casual: { label: 'Casual', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)' },
  work: { label: 'Work', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
  important: { label: 'Important', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' }
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
