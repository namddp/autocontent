'use client';

// month-year-picker — Reusable picker chuyển tháng/năm (◀ Tháng 3/2026 ▶)

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthYearPickerProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

export function MonthYearPicker({ month, year, onChange }: MonthYearPickerProps) {
  const handlePrev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const handleNext = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-1 py-1">
      <button
        onClick={handlePrev}
        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="px-3 text-sm font-semibold text-slate-800 min-w-[120px] text-center">
        {MONTH_NAMES[month - 1]} / {year}
      </span>
      <button
        onClick={handleNext}
        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
