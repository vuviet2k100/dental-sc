'use client';

interface Column {
  header: string;
  accessor: string;
}

export default function DataTable({ data, columns }: { data: any[], columns: Column[] }) {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-400 uppercase text-xs">
          <tr>
            {columns.map((col, i) => <th key={i} className="p-4">{col.header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50">
              {columns.map((col, j) => <td key={j} className="p-4">{row[col.accessor]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}