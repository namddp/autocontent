'use client';

// finance-salary-editable-table — bảng lương tháng có thể chỉnh sửa inline
// Columns: STT | Tên NV | Ngày | Lương CB | Trách nhiệm | Ăn trưa | HH Ca | HH CTV | BHXH(-) | Thưởng | TỔNG | Action
// Footer tổng hợp theo cột

import { formatVNDShort } from '@/lib/format-currency-vnd';
import type { SalaryRow, UpsertSalaryPayload } from '@/hooks/use-salary-monthly-queries';
import { FinanceSalaryEditableRow } from './finance-salary-editable-row';

interface Props {
  rows: SalaryRow[];
  month: number;
  year: number;
  isSaving: boolean;
  onSave: (userId: string, payload: UpsertSalaryPayload) => void;
}

const HEADERS = ['#', 'Tên NV', 'Ngày', 'Lương CB', 'Trách nhiệm', 'Ăn trưa', 'HH Ca', 'HH CTV', 'BHXH (-)', 'Thưởng', 'TỔNG', ''];

function colTotal(rows: SalaryRow[], field: keyof SalaryRow): number {
  return rows.reduce((sum, r) => sum + (Number(r[field]) || 0), 0);
}

export function FinanceSalaryEditableTable({ rows, isSaving, onSave }: Props) {
  if (rows.length === 0) {
    return (
      <div className="card py-12 text-center text-sm text-slate-400">
        Không có nhân viên nào
      </div>
    );
  }

  const totalBaseSalary = colTotal(rows, 'baseSalary');
  const totalResponsibility = colTotal(rows, 'responsibilityPay');
  const totalMeal = colTotal(rows, 'mealAllowance');
  const totalCaseCommission = colTotal(rows, 'caseCommission');
  const totalCtvCommission = colTotal(rows, 'ctvCommission');
  const totalInsurance = colTotal(rows, 'socialInsurance');
  const totalBonus = colTotal(rows, 'bonus');
  const totalPay = colTotal(rows, 'totalPay');

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {HEADERS.map((h) => (
                <th key={h} className="table-th text-[11px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <FinanceSalaryEditableRow
                key={row.userId}
                row={row}
                index={i}
                isSaving={isSaving}
                onSave={onSave}
              />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-xs">
              <td colSpan={3} className="table-td text-right text-slate-600">TỔNG</td>
              <td className="table-td text-right">{formatVNDShort(totalBaseSalary)}</td>
              <td className="table-td text-right">{formatVNDShort(totalResponsibility)}</td>
              <td className="table-td text-right">{formatVNDShort(totalMeal)}</td>
              <td className="table-td text-right">{formatVNDShort(totalCaseCommission)}</td>
              <td className="table-td text-right">{formatVNDShort(totalCtvCommission)}</td>
              <td className="table-td text-right text-red-600">{formatVNDShort(totalInsurance)}</td>
              <td className="table-td text-right">{formatVNDShort(totalBonus)}</td>
              <td className="table-td text-right text-emerald-700">{formatVNDShort(totalPay)}</td>
              <td className="table-td" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
