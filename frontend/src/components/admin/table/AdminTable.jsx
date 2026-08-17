"use client"
import { Pencil, Trash2 } from "lucide-react";

export default function AdminTable({ columns = [], data = [], onEdit, onDelete }) {
  return (
    <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key} className="p-2 text-left">{col.label}</th>
          ))}
          <th className="p-2">Hành động</th>
        </tr>
      </thead>
      <tbody>
        {data?.length > 0 ? (
          data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map(col => (
                <td key={`${row.id || rowIndex}-${col.key}`} className="p-2">
                  {row[col.key]}
                </td>
              ))}
              <td className="p-2 text-center">
                {/* Kiểm tra nếu có hàm onEdit thì mới cho thực thi */}
                <button 
                  onClick={() => onEdit && onEdit(row)} 
                  className="mr-2 text-blue-500"
                >
                  <Pencil size={18} />
                </button>
                
                {/* Kiểm tra nếu có hàm onDelete thì mới cho thực thi */}
                <button 
                  onClick={() => onDelete && onDelete(row.id)} 
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '10px' }}>
              Không có dữ liệu hiển thị
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}