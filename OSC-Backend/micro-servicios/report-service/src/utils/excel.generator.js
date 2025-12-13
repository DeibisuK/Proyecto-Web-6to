import ExcelJS from 'exceljs';

/**
 * Genera un archivo Excel con los datos del reporte
 * @param {Object} options - Opciones del reporte
 * @param {string} options.title - Título del reporte
 * @param {string} options.subtitle - Subtítulo del reporte
 * @param {Object} options.data - Datos del reporte (rows, columns, summary)
 * @param {Object} options.filters - Filtros aplicados
 * @param {string} options.usuario - Usuario que genera el reporte
 * @returns {Promise<Buffer>} Buffer del Excel generado
 */
export async function generateExcel(options) {
  try {
    const { title, subtitle, data, filters = {}, usuario = 'Sistema' } = options;
    
    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Oro Sports Club';
    workbook.created = new Date();
    
    // Hoja 1: Datos principales
    const worksheet = workbook.addWorksheet('Reporte');
    
    // ============ ENCABEZADO MODERNO ============
    // Fila 1: Banner Oro Sports Club (color verde)
    worksheet.mergeCells('A1:H1');
    const bannerCell = worksheet.getCell('A1');
    bannerCell.value = 'Oro Sports Club';
    bannerCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    bannerCell.alignment = { vertical: 'middle', horizontal: 'center' };
    bannerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF25D366' }
    };
    worksheet.getRow(1).height = 30;
    
    // Fila 2: Información de generación
    const fechaGeneracion = new Date().toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    worksheet.mergeCells('A2:D2');
    const infoCell = worksheet.getCell('A2');
    infoCell.value = `Fecha de generación: ${fechaGeneracion}`;
    infoCell.font = { name: 'Calibri', size: 10, color: { argb: 'FF6B7280' } };
    infoCell.alignment = { vertical: 'middle', horizontal: 'left' };
    
    worksheet.mergeCells('E2:H2');
    const userCell = worksheet.getCell('E2');
    userCell.value = `Generado por: ${usuario}`;
    userCell.font = { name: 'Calibri', size: 10, color: { argb: 'FF6B7280' } };
    userCell.alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getRow(2).height = 20;
    
    // Espacio
    worksheet.addRow([]);
    
    // Fila 4: Título del Reporte
    worksheet.mergeCells('A4:H4');
    const titleCell = worksheet.getCell('A4');
    titleCell.value = title;
    titleCell.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF1F2937' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(4).height = 25;
    
    // Fila 5: Subtítulo
    worksheet.mergeCells('A5:H5');
    const subtitleCell = worksheet.getCell('A5');
    subtitleCell.value = subtitle;
    subtitleCell.font = { name: 'Calibri', size: 12, color: { argb: 'FF6B7280' } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Espacio
    worksheet.addRow([]);
    
    // ============ DATOS ============
    if (data && data.rows && data.rows.length > 0) {
      // Encabezados de datos (Fila 7)
      const columns = data.columns || Object.keys(data.rows[0]);
      const headerRow = worksheet.addRow(columns);
      
      // Estilo de encabezados con color verde OSC
      headerRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF059669' } // Verde secundario
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF059669' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'medium', color: { argb: 'FF059669' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
      });
      headerRow.height = 25;
      
      // Filas de datos con estilo alternado
      data.rows.forEach((row, index) => {
        const dataRow = worksheet.addRow(Object.values(row));
        dataRow.eachCell((cell) => {
          cell.font = { name: 'Calibri', size: 10 };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          
          // Filas alternadas
          if (index % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF9FAFB' }
            };
          }
          
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
        });
      });
      
      // Ajustar ancho de columnas automáticamente
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(Math.max(maxLength + 2, 15), 50);
      });
      
      // Habilitar filtros en encabezados
      worksheet.autoFilter = {
        from: `A7`,
        to: `${String.fromCharCode(64 + columns.length)}7`
      };
      
    } else {
      // Mensaje cuando no hay datos
      worksheet.mergeCells('A7:H7');
      const noDataCell = worksheet.getCell('A7');
      noDataCell.value = 'No hay datos disponibles para el periodo seleccionado';
      noDataCell.font = { name: 'Calibri', size: 11, color: { argb: 'FF6B7280' } };
      noDataCell.alignment = { vertical: 'middle', horizontal: 'center' };
      noDataCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' }
      };
      worksheet.getRow(7).height = 30;
    }
    
    // ============ HOJA 2: RESUMEN (si existe) ============
    if (data && data.summary) {
      const summarySheet = workbook.addWorksheet('Resumen');
      
      // Banner
      summarySheet.mergeCells('A1:B1');
      const summaryBannerCell = summarySheet.getCell('A1');
      summaryBannerCell.value = 'RESUMEN EJECUTIVO';
      summaryBannerCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      summaryBannerCell.alignment = { vertical: 'middle', horizontal: 'center' };
      summaryBannerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF059669' }
      };
      summarySheet.getRow(1).height = 30;
      
      summarySheet.addRow([]);
      
      // Encabezados
      const summaryHeaderRow = summarySheet.addRow(['Métrica', 'Valor']);
      summaryHeaderRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF25D366' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      
      // Datos del resumen
      Object.entries(data.summary).forEach(([key, value]) => {
        const row = summarySheet.addRow([key, value]);
        row.eachCell((cell) => {
          cell.font = { name: 'Arial', size: 10 };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
        });
      });
      
      summarySheet.columns.forEach((column) => {
        column.width = 30;
      });
    }
    
    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
    
  } catch (error) {
    throw error;
  }
}
