export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function estimateJsonSize(obj: any): number {
  // Convert to JSON string and get byte length
  const jsonString = JSON.stringify(obj)
  return new Blob([jsonString]).size
}

export function estimateCsvSize(rows: any[], columns: string[]): number {
  // Estimate header row
  let size = columns.join(',').length + 1 // +1 for newline

  // Estimate data rows
  rows.forEach(row => {
    size += columns.map(col => {
      const value = row[col]
      if (typeof value === 'string') {
        // Account for potential quote escaping
        return value.replace(/"/g, '""').length + 2 // +2 for surrounding quotes
      }
      return String(value ?? '').length
    }).join(',').length + 1 // +1 for newline
  })

  return size
}

export function estimateExportSize(
  data: any[],
  format: 'csv' | 'json',
  columns?: string[]
): number {
  if (format === 'json') {
    return estimateJsonSize(data)
  }
  
  if (format === 'csv' && columns) {
    return estimateCsvSize(data, columns)
  }
  
  return 0
}
