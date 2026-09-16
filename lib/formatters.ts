import { Currency } from '@/types';

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    // If it's a date-only string like YYYY-MM-DD, format directly to prevent timezone shift
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
      const [year, month, day] = dateString.trim().split('-');
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function isDateOverdue(dateString?: string): boolean {
  if (!dateString) return false;
  try {
    let target: Date;
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
      const [y, m, d] = dateString.trim().split('-').map(Number);
      target = new Date(y, m - 1, d, 23, 59, 59, 999);
    } else {
      target = new Date(dateString);
      target.setHours(23, 59, 59, 999);
    }
    const now = new Date();
    return target.getTime() < now.getTime();
  } catch {
    return false;
  }
}

export function isDateUpcoming(dateString?: string, daysAhead = 3): boolean {
  if (!dateString) return false;
  try {
    let target: Date;
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
      const [y, m, d] = dateString.trim().split('-').map(Number);
      target = new Date(y, m - 1, d, 23, 59, 59, 999);
    } else {
      target = new Date(dateString);
      target.setHours(23, 59, 59, 999);
    }
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + daysAhead);
    future.setHours(23, 59, 59, 999);
    return target.getTime() >= now.getTime() && target.getTime() <= future.getTime();
  } catch {
    return false;
  }
}
