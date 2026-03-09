'use client';

// finance-salary-editable-row — một hàng trong bảng lương có thể chỉnh sửa inline
// Mỗi ô số: click để nhập, blur để lưu display dạng VND

import { useState } from 'react';
import { formatVNDShort } from '@/lib/format-currency-vnd';
import type { SalaryRow, UpsertSalaryPayload } from '@/hooks/use-salary-monthly-queries';

interface Props {
  row: SalaryRow;
  index: number;
  isSaving: boolean;
  onSave: (userId: string, payload: UpsertSalaryPayload) => void;
}

type NumericField = 'baseSalary' | 'responsibilityPay' | 'mealAllowance' | 'caseCommission' | 'ctvCommission' | 'socialInsurance' | 'bonus';

const NUMERIC_FIELDS: NumericField[] = [
  'baseSalary', 'responsibilityPay', 'mealAllowance', 'caseCommission', 'ctvCommission', 'socialInsurance', 'bonus',
];

export function FinanceSalaryEditableRow({ row, index, isSaving, onSave }: Props) {
  const [draft, setDraft] = useState<Partial<Record<NumericField, number>>>({});
  const [editing, setEditing] = useState<NumericField | null>(null);
  const [workDays, setWorkDays] = useState<number>(row.workDays);
  const [editingWorkDays, setEditingWorkDays] = useState(false);

  const getValue = (field: NumericField): number =>
    draft[field] !== undefined ? draft[field]! : row[field];

  const computedTotal =
    getValue('baseSalary') +
    getValue('responsibilityPay') +
    getValue('mealAllowance') +
    getValue('caseCommission') +
    getValue('ctvCommission') +
    getValue('bonus') -
    getValue('socialInsurance');

  const isDirty = Object.keys(draft).length > 0 || workDays !== row.workDays;

  const handleSave = () => {
    const payload: UpsertSalaryPayload = { workDays };
    NUMERIC_FIELDS.forEach((f) => { payload[f] = getValue(f); });
    onSave(row.userId, payload);
    setDraft({});
  };

  return (
    <tr className="table-row">
      <td className="table-td text-slate-400 font-mono text-center">{index + 1}</td>
      <td className="table-td font-medium text-slate-800 whitespace-nowrap">
        {row.displayName ?? row.fullName}
      </td>

      {/* Số ngày công */}
      <td className="table-td text-center">
        {editingWorkDays ? (
          <input
            type="number"
            className="w-12 text-center border border-blue-300 rounded px-1 py-0.5 text-xs focus:outline-none"
            defaultValue={workDays}
            autoFocus
            onBlur={(e) => { setWorkDays(Number(e.target.value)); setEditingWorkDays(false); }}
          />
        ) : (
          <span className="cursor-pointer hover:bg-slate-100 rounded px-1" onClick={() => setEditingWorkDays(true)}>
            {workDays}
          </span>
        )}
      </td>

      {/* Các cột số tiền */}
      {NUMERIC_FIELDS.map((field) => (
        <td key={field} className="table-td text-right">
          {editing === field ? (
            <input
              type="number"
              className="w-24 text-right border border-blue-300 rounded px-1 py-0.5 text-xs focus:outline-none"
              defaultValue={getValue(field)}
              autoFocus
              onBlur={(e) => {
                setDraft((d) => ({ ...d, [field]: Number(e.target.value) }));
                setEditing(null);
              }}
            />
          ) : (
            <span
              className="cursor-pointer hover:bg-slate-100 rounded px-1"
              onClick={() => setEditing(field)}
            >
              {formatVNDShort(getValue(field))}
            </span>
          )}
        </td>
      ))}

      {/* Tổng */}
      <td className="table-td text-right font-semibold text-slate-800">
        {formatVNDShort(computedTotal)}
      </td>

      {/* Nút lưu */}
      <td className="table-td text-center">
        <button
          disabled={!isDirty || isSaving}
          onClick={handleSave}
          className="rounded px-2 py-0.5 text-[11px] font-medium transition-colors disabled:opacity-30 bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed"
        >
          Lưu
        </button>
      </td>
    </tr>
  );
}
