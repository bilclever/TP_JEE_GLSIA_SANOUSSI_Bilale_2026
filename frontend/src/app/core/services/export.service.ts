// export.service.ts
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  field: string;
  width?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor() {}

  /**
   * Export data to Excel file
   */
  exportToExcel(data: any[], filename: string = 'export', columns?: ExportColumn[]): void {
    try {
      // Prepare data
      let exportData: any[];
      
      if (columns) {
        // Map data according to columns configuration
        exportData = data.map(item => {
          const row: any = {};
          columns.forEach(col => {
            row[col.header] = this.getNestedValue(item, col.field);
          });
          return row;
        });
      } else {
        // Use data as is
        exportData = data;
      }

      // Create worksheet
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths if specified
      if (columns) {
        const wscols = columns.map(col => ({ wch: col.width || 15 }));
        ws['!cols'] = wscols;
      }

      // Create workbook
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');

      // Save file
      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export to Excel');
    }
  }

  /**
   * Export data to CSV file
   */
  exportToCSV(data: any[], filename: string = 'export', columns?: ExportColumn[]): void {
    try {
      let csvContent = '';

      if (columns) {
        // Add headers
        csvContent += columns.map(col => this.escapeCSV(col.header)).join(',') + '\n';

        // Add rows
        data.forEach(item => {
          const row = columns.map(col => {
            const value = this.getNestedValue(item, col.field);
            return this.escapeCSV(value);
          });
          csvContent += row.join(',') + '\n';
        });
      } else {
        // Auto-detect headers from first object
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          csvContent += headers.map(h => this.escapeCSV(h)).join(',') + '\n';

          data.forEach(item => {
            const row = headers.map(h => this.escapeCSV(item[h]));
            csvContent += row.join(',') + '\n';
          });
        }
      }

      // Download file
      const timestamp = new Date().toISOString().split('T')[0];
      this.downloadFile(csvContent, `${filename}_${timestamp}.csv`, 'text/csv;charset=utf-8;');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw new Error('Failed to export to CSV');
    }
  }

  /**
   * Export data to JSON file
   */
  exportToJSON(data: any[], filename: string = 'export'): void {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const timestamp = new Date().toISOString().split('T')[0];
      this.downloadFile(jsonContent, `${filename}_${timestamp}.json`, 'application/json;charset=utf-8;');
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw new Error('Failed to export to JSON');
    }
  }

  /**
   * Print table data
   */
  printTable(data: any[], title: string = 'Report', columns?: ExportColumn[]): void {
    try {
      let printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .print-date { text-align: right; color: #666; margin-top: 10px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="print-date">Date: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
      `;

      // Add headers
      if (columns) {
        columns.forEach(col => {
          printContent += `<th>${col.header}</th>`;
        });
      } else if (data.length > 0) {
        Object.keys(data[0]).forEach(key => {
          printContent += `<th>${key}</th>`;
        });
      }

      printContent += `
              </tr>
            </thead>
            <tbody>
      `;

      // Add rows
      data.forEach(item => {
        printContent += '<tr>';
        if (columns) {
          columns.forEach(col => {
            const value = this.getNestedValue(item, col.field);
            printContent += `<td>${this.escapeHTML(value)}</td>`;
          });
        } else {
          Object.values(item).forEach(value => {
            printContent += `<td>${this.escapeHTML(value)}</td>`;
          });
        }
        printContent += '</tr>';
      });

      printContent += `
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `;

      // Open print window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Error printing table:', error);
      throw new Error('Failed to print table');
    }
  }

  /**
   * Helper: Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj) ?? '';
  }

  /**
   * Helper: Escape CSV values
   */
  private escapeCSV(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  /**
   * Helper: Escape HTML values
   */
  private escapeHTML(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    return stringValue
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Helper: Download file
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
