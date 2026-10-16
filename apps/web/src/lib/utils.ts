export function formatPrice(value: number, currency: string = 'ARS'): string {
  return `${currency} ${value.toLocaleString('es-AR')}`;
}

export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getStatusColor(status?: string): string {
  switch (status) {
    case 'good':
      return '#7a8a5e';
    case 'warning':
      return '#e9b949';
    case 'alert':
      return '#b64a3a';
    default:
      return '#c67139';
  }
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function daysAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
}
