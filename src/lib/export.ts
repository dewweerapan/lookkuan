import * as XLSX from 'xlsx';

/**
 * Lightweight CSV export utility (no external dependencies)
 */

function escapeCSV(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCSV(filename: string, rows: Record<string, unknown>[], headers?: Record<string, string>) {
  if (rows.length === 0) return

  const keys = Object.keys(rows[0])
  const headerRow = keys.map(k => escapeCSV(headers?.[k] ?? k)).join(',')
  const dataRows = rows.map(row => keys.map(k => escapeCSV(row[k])).join(','))

  const csv = [headerRow, ...dataRows].join('\n')
  const bom = '\uFEFF' // UTF-8 BOM for Thai characters in Excel
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToXLSX(
  filename: string,
  sheets: { name: string; rows: Record<string, unknown>[] }[],
) {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    if (sheet.rows.length === 0) continue;
    const ws = XLSX.utils.json_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
