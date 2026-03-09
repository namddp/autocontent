// format-currency-vnd — helper hiển thị tiền VND dạng ngắn và đầy đủ

const formatter = new Intl.NumberFormat('vi-VN');

// Format đầy đủ: 18.468.000đ
export function formatVND(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return `${formatter.format(amount)}đ`;
}

// Format ngắn: 18.5tr, 1.2tr, 800k
export function formatVNDShort(amount: number | null | undefined): string {
  if (amount == null) return '—';
  if (amount === 0) return '0đ';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}tỷ`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}tr`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}k`;
  return `${sign}${abs}đ`;
}
