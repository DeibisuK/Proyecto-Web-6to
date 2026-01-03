import PDFDocument from 'pdfkit';

/**
 * Genera un PDF con los datos del reporte
 * @param {Object} options - Opciones del reporte
 * @param {string} options.title - Título del reporte
 * @param {string} options.subtitle - Subtítulo del reporte
 * @param {Object} options.data - Datos del reporte (rows, columns, summary)
 * @param {Object} options.filters - Filtros aplicados
 * @param {string} options.usuario - Usuario que genera el reporte
 * @param {Array} options.headers - Encabezados de la tabla (para facturas)
 * @param {Array} options.rows - Filas de datos (para facturas)
 * @param {Array} options.totals - Totales (para facturas)
 * @param {Object} options.metadata - Metadatos adicionales (para facturas)
 * @param {string} options.qrCode - Código QR en base64 (para facturas)
 * @param {string} options.qrText - Texto descriptivo del QR code
 * @param {string} options.footer - Pie de página
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
export async function generatePDF(options) {
  return new Promise((resolve, reject) => {
    try {
      const { 
        title, 
        subtitle, 
        data, 
        filters = {}, 
        usuario = 'Sistema',
        headers,
        rows,
        totals,
        metadata,
        qrCode,
        qrText = 'Escanea este código',
        footer
      } = options;
      
      // Crear documento PDF
      const doc = new PDFDocument({ 
        size: 'LETTER',
        margins: { top: 60, bottom: 60, left: 40, right: 40 }
      });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // ============ ENCABEZADO MODERNO ============
      // Banda superior con color primario
      doc.rect(0, 0, 612, 100)
         .fill('#25D366');
      
      // Logo y nombre de la empresa
      doc.fontSize(28)
         .fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .text('Oro Sports Club', 40, 35);

      // Información de generación (derecha) con rectángulos redondeados
      const fechaGeneracion = new Date().toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Rectángulo redondeado para fecha
      doc.roundedRect(380, 28, 190, 28, 6)
         .fillColor('#FFFFFF')
         .fillOpacity(0.95)
         .fill();
      
      doc.fillOpacity(1);
      doc.fontSize(7)
         .fillColor('#6B7280')
         .font('Helvetica')
         .text('FECHA DE GENERACIÓN', 388, 32);
      
      doc.fontSize(9)
         .fillColor('#1F2937')
         .font('Helvetica-Bold')
         .text(fechaGeneracion, 388, 43, { width: 174 });
      
      // Rectángulo redondeado para usuario
      doc.roundedRect(380, 62, 190, 28, 6)
         .fillColor('#FFFFFF')
         .fillOpacity(0.95)
         .fill();
      
      doc.fillOpacity(1);
      doc.fontSize(7)
         .fillColor('#6B7280')
         .font('Helvetica')
         .text('GENERADO POR', 388, 66);
      
      doc.fontSize(9)
         .fillColor('#1F2937')
         .font('Helvetica-Bold')
         .text(usuario || 'Sistema', 388, 77, { 
           width: 174,
           ellipsis: true 
         });

      // ============ TÍTULO DEL REPORTE ============
      doc.fontSize(18)
         .fillColor('#1F2937')
         .font('Helvetica-Bold')
         .text(title, 40, 120);
      
      // Subtítulo con filtros
      doc.fontSize(11)
         .fillColor('#6B7280')
         .font('Helvetica')
         .text(subtitle, 40, 145);

      // Línea separadora elegante
      doc.moveTo(40, 170)
         .lineTo(572, 170)
         .strokeColor('#25D366')
         .lineWidth(2)
         .stroke();

      // ============ METADATOS (para facturas) ============
      if (metadata) {
        let metaY = 190;
        const metaEntries = Object.entries(metadata);
        
        metaEntries.forEach(([key, value]) => {
          doc.fontSize(9)
             .fillColor('#6B7280')
             .font('Helvetica')
             .text(`${key}:`, 40, metaY, { width: 100 });
          
          doc.fontSize(9)
             .fillColor('#1F2937')
             .font('Helvetica-Bold')
             .text(String(value), 145, metaY, { width: 420 });
          
          metaY += 20;
        });

        // Ajustar posición para la tabla
        doc.moveDown();
      }

      // ============ TABLA DE DATOS (FORMATO SIMPLIFICADO PARA FACTURAS) ============
      if (headers && rows && rows.length > 0) {
        const tableWidth = 532;
        const tableX = 40;
        let tableY = metadata ? doc.y + 20 : 190;
        const rowHeight = 25;
        const columnWidth = tableWidth / headers.length;

        // Dibujar encabezados
        doc.rect(tableX, tableY, tableWidth, rowHeight)
           .fillColor('#25D366')
           .fill();

        doc.font('Helvetica-Bold')
           .fontSize(9)
           .fillColor('#FFFFFF');

        headers.forEach((header, i) => {
          const x = tableX + (i * columnWidth);
          doc.text(header, x + 5, tableY + 8, {
            width: columnWidth - 10,
            align: i === 0 ? 'left' : 'center'
          });
        });

        tableY += rowHeight;

        // Dibujar filas de datos
        rows.forEach((row, rowIndex) => {
          // Fondo alternado
          if (rowIndex % 2 === 0) {
            doc.rect(tableX, tableY, tableWidth, rowHeight)
               .fillColor('#F9FAFB')
               .fill();
          }

          doc.font('Helvetica')
             .fontSize(8)
             .fillColor('#1F2937');

          row.forEach((cell, i) => {
            const x = tableX + (i * columnWidth);
            doc.text(String(cell), x + 5, tableY + 8, {
              width: columnWidth - 10,
              align: i === 0 ? 'left' : 'center'
            });
          });

          tableY += rowHeight;
        });

        // Totales
        if (totals && totals.length > 0) {
          tableY += 10;
          
          totals.forEach(total => {
            doc.rect(tableX, tableY, tableWidth, rowHeight)
               .fillColor('#ECFDF5')
               .fill();
            
            doc.fontSize(11)
               .fillColor('#059669')
               .font('Helvetica-Bold')
               .text(total.label, tableX + 10, tableY + 8, { width: 400 })
               .text(total.value, tableX + 410, tableY + 8, { width: 112, align: 'right' });
            
            tableY += rowHeight;
          });
        }

        // QR Code
        if (qrCode) {
          tableY += 20;
          doc.image(qrCode, tableX + tableWidth - 130, tableY, { width: 120, height: 120 });
          
          doc.fontSize(8)
             .fillColor('#6B7280')
             .font('Helvetica')
             .text(qrText, tableX + tableWidth - 130, tableY + 125, { 
               width: 120, 
               align: 'center' 
             });
        }

        // Footer
        if (footer) {
          const footerY = 720;
          doc.fontSize(10)
             .fillColor('#6B7280')
             .font('Helvetica-Oblique')
             .text(footer, 40, footerY, { width: 532, align: 'center' });
        }
      }
      // ============ TABLA DE DATOS (FORMATO ORIGINAL PARA REPORTES) ============
      else if (data && data.rows && data.rows.length > 0) {
        const columns = data.columns || Object.keys(data.rows[0]);
        const tableWidth = 532;
        const tableX = 40;
        let tableY = 190;
        const rowHeight = 22;
        
        // Calcular anchos de columna dinámicamente (mínimo 60px)
        const numCols = columns.length;
        const minColWidth = 60;
        const columnWidth = Math.max(tableWidth / numCols, minColWidth);
        
        // Si las columnas son demasiadas, limitar a las primeras 8
        const visibleColumns = numCols > 8 ? columns.slice(0, 8) : columns;
        const actualTableWidth = columnWidth * visibleColumns.length;

        // Dibujar encabezados
        doc.rect(tableX, tableY, actualTableWidth, rowHeight)
           .fillColor('#25D366')
           .fill();

        doc.font('Helvetica-Bold')
           .fontSize(8)
           .fillColor('#FFFFFF');

        visibleColumns.forEach((col, i) => {
          const x = tableX + (i * columnWidth);
          const text = String(col).substring(0, 15);
          doc.text(text, x + 3, tableY + 7, {
            width: columnWidth - 6,
            align: 'left',
            lineBreak: false,
            ellipsis: true
          });
        });

        tableY += rowHeight;

        // Dibujar filas de datos (máximo 30 filas para no saturar)
        const maxRows = Math.min(data.rows.length, 30);
        
        for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
          const row = data.rows[rowIndex];
          const values = Object.values(row);
          const visibleValues = numCols > 8 ? values.slice(0, 8) : values;
          
          // Fondo alternado
          if (rowIndex % 2 === 0) {
            doc.rect(tableX, tableY, actualTableWidth, rowHeight)
               .fillColor('#F9FAFB')
               .fill();
          }

          doc.font('Helvetica')
             .fontSize(7)
             .fillColor('#1F2937');

          visibleValues.forEach((value, i) => {
            const x = tableX + (i * columnWidth);
            let text = String(value ?? '');
            // Truncar texto largo
            if (text.length > 25) text = text.substring(0, 22) + '...';
            
            doc.text(text, x + 3, tableY + 7, {
              width: columnWidth - 6,
              align: 'left',
              lineBreak: false,
              ellipsis: true
            });
          });

          tableY += rowHeight;

          // Nueva página si es necesario
          if (tableY > 680) {
            doc.addPage();
            tableY = 60;
          }
        }
        
        // Nota si hay más filas
        if (data.rows.length > maxRows) {
          tableY += 10;
          doc.fontSize(8)
             .fillColor('#6B7280')
             .font('Helvetica-Oblique')
             .text(`Mostrando ${maxRows} de ${data.rows.length} registros. Descargue el Excel para ver todos.`, 
                   tableX, tableY);
        }
      } else {
        // Mensaje cuando no hay datos
        doc.rect(40, 190, 532, 60)
           .fillColor('#F3F4F6')
           .fill();
        
        doc.fontSize(11)
           .fillColor('#6B7280')
           .font('Helvetica')
           .text('No hay datos disponibles para el periodo seleccionado', 60, 210);
      }

      // ============ RESUMEN (si existe) ============
      if (data && data.summary) {
        const summaryEntries = Object.entries(data.summary).slice(0, 5); // Max 5 entradas
        const currentY = doc.y;
        
        // Solo agregar resumen si hay espacio suficiente
        if (currentY < 600) {
          const boxHeight = summaryEntries.length * 20 + 35;
          
          // Caja de resumen con estilo moderno
          doc.rect(40, currentY + 15, 532, boxHeight)
             .fillColor('#ECFDF5')
             .fill();
          
          doc.fontSize(11)
             .fillColor('#059669')
             .font('Helvetica-Bold')
             .text('RESUMEN', 55, currentY + 25);
          
          let summaryY = currentY + 45;
          summaryEntries.forEach(([key, value]) => {
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor('#6B7280')
               .text(`${key}:`, 70, summaryY, { width: 200 })
               .font('Helvetica-Bold')
               .fillColor('#1F2937')
               .text(value.toString(), 280, summaryY, { width: 250 });
            summaryY += 20;
          });
        }
      }

      // Finalizar el documento
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Calcula tamaños automáticos para las columnas
 */
function calculateColumnSizes(columns) {
  const totalWidth = 532;
  const columnWidth = totalWidth / columns.length;
  return Array(columns.length).fill(columnWidth);
}
