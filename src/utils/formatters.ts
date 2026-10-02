/**
 * Currency and date formatting utilities for Ledger
 */

const etbFormatter = new Intl.NumberFormat('en-ET', {
  style: 'currency',
  currency: 'ETB',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format an amount in Ethiopian Birr (ETB)
 * Example: ETB 1,250.00
 */
export function formatETB(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'ETB 0.00';
  }
  try {
    return etbFormatter.format(amount);
  } catch {
    return `ETB ${decimalFormatter.format(amount)}`;
  }
}

/**
 * Formats a raw number without currency code for compact displays
 */
export function formatRawAmount(amount: number): string {
  return decimalFormatter.format(amount);
}

/**
 * Friendly date label (e.g. "Today", "Yesterday", "Monday, Oct 14")
 */
export function formatDateGroup(dateStr: string): string {
  if (!dateStr) return '';
  
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yYear = yesterday.getFullYear();
  const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yDay = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

  if (dateStr === todayStr) {
    return 'Today';
  }
  if (dateStr === yesterdayStr) {
    return 'Yesterday';
  }

  // Parse YYYY-MM-DD safely without timezone shifts
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);

  return targetDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format Month Key (e.g. "2026-10") to human-readable "October 2026"
 */
export function formatMonthLabel(monthKey: string): string {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format short month label (e.g. "Oct")
 */
export function formatMonthShort(monthKey: string): string {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', {
    month: 'short',
  });
}

/**
 * Get current date string in YYYY-MM-DD
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get month key from a date string (YYYY-MM)
 */
export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}
