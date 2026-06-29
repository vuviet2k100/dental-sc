'use client';
import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor?: keyof T | string; // key có thể là string hoặc key của object
  render?: (row: T) => ReactNode; // Cho phép custom UI (button, badge, logic phức tạp)
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
}

export default function DataTable<T extends { id: string | number }>({ data, columns }: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border">Không có dữ liệu</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-400 uppercase text-xs">
          <tr>
            {columns.map((col, i) => <th key={i} className="p-4">{col.header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              {columns.map((col, i) => (
                <td key={i} className="p-4">
                  {/* Nếu có hàm render thì gọi hàm đó, nếu không thì lấy giá trị accessor */}
                  {col.render ? col.render(row) : (row as any)[col.accessor as string]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}