import * as canchasService from '../services/canchas.report.service.js';
import * as arbitrosService from '../services/arbitros.report.service.js';
import * as ingresosService from '../services/ingresos.report.service.js';
import * as productosService from '../services/productos.report.service.js';
import * as equiposService from '../services/equipos.report.service.js';
import * as partidosService from '../services/partidos.report.service.js';
import * as reservasService from '../services/reservas.report.service.js';
import * as sedesService from '../services/sedes.report.service.js';
import * as torneosService from '../services/torneos.report.service.js';
import * as usuariosService from '../services/usuarios.report.service.js';
import { generatePDF } from '../utils/pdf.generator.js';
import { generateExcel } from '../utils/excel.generator.js';

/**
 * Main controller for report generation
 * Request body format:
 * {
 *   category: 'canchas' | 'arbitros' | 'ingresos' | 'productos' | 'equipos' | 'partidos' | 'reservas' | 'sedes' | 'torneos' | 'usuarios',
 *   option: 'listar-canchas' | 'mas-utilizadas' | etc.,
 *   filters: { year: 2024, month: 12 },
 *   format: 'pdf' | 'excel'
 * }
 */
export const generateReport = async (req, res) => {
  try {
    const { category, option, filters, format } = req.body;

    // Validaciones
    if (!category || !option || !format) {
      return res.status(400).json({ 
        message: 'Faltan parámetros requeridos: category, option, format' 
      });
    }

    if (!['pdf', 'excel'].includes(format.toLowerCase())) {
      return res.status(400).json({ 
        message: 'Formato inválido. Use "pdf" o "excel"' 
      });
    }

    // Obtener datos según categoría y opción
    let reportData;
    let reportTitle;
    
    switch (category) {
      case 'canchas':
        reportData = await canchasService.getReportData(option, filters);
        reportTitle = getCanchasTitle(option);
        break;
      case 'arbitros':
        reportData = await arbitrosService.getReportData(option, filters);
        reportTitle = getArbitrosTitle(option);
        break;
      case 'ingresos':
        reportData = await ingresosService.getReportData(option, filters);
        reportTitle = getIngresosTitle(option);
        break;
      case 'productos':
        reportData = await productosService.getReportData(option, filters);
        reportTitle = getProductosTitle(option);
        break;
      case 'equipos':
        reportData = await equiposService.getReportData(option, filters);
        reportTitle = getEquiposTitle(option);
        break;
      case 'partidos':
        reportData = await partidosService.getReportData(option, filters);
        reportTitle = getPartidosTitle(option);
        break;
      case 'reservas':
        reportData = await reservasService.getReportData(option, filters);
        reportTitle = getReservasTitle(option);
        break;
      case 'sedes':
        reportData = await sedesService.getReportData(option, filters);
        reportTitle = getSedesTitle(option);
        break;
      case 'torneos':
        reportData = await torneosService.getReportData(option, filters);
        reportTitle = getTorneosTitle(option);
        break;
      case 'usuarios':
        reportData = await usuariosService.getReportData(option, filters);
        reportTitle = getUsuariosTitle(option);
        break;
      default:
        return res.status(400).json({ 
          message: `Categoría inválida: ${category}` 
        });
    }

    // Generar archivo según formato
    const monthName = filters?.month ? getMonthName(filters.month) : 'Todos los meses';
    const year = filters?.year || new Date().getFullYear();
    const usuario = req.user?.name_user || req.user?.email || 'Administrador';
    
    if (format.toLowerCase() === 'pdf') {
      const pdfBuffer = await generatePDF({
        title: reportTitle,
        subtitle: `Periodo: ${monthName} ${year}`,
        data: reportData,
        filters,
        usuario
      });

      const filename = `Reporte_${category}_${option}_${monthName}_${year}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
      
    } else if (format.toLowerCase() === 'excel') {
      const excelBuffer = await generateExcel({
        title: reportTitle,
        subtitle: `Periodo: ${monthName} ${year}`,
        data: reportData,
        filters,
        usuario
      });

      const filename = `Reporte_${category}_${option}_${monthName}_${year}.xlsx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(excelBuffer);
    }

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      message: 'Error al generar el reporte',
      error: error.message 
    });
  }
};

// Helper functions for titles
function getCanchasTitle(option) {
  const titles = {
    'listar-canchas': 'Listado de Canchas',
    'mas-utilizadas': 'Canchas Más Utilizadas',
    'mejor-puntuadas': 'Canchas Mejor Puntuadas',
    'ingresos-cancha': 'Ingresos por Cancha',
    'tasa-ocupacion': 'Tasa de Ocupación de Canchas'
  };
  return titles[option] || 'Reporte de Canchas';
}

function getArbitrosTitle(option) {
  const titles = {
    'listar-arbitros': 'Listado de Árbitros',
    'mas-partidos': 'Árbitros con Más Partidos',
    'arbitros-deporte': 'Árbitros por Deporte',
    'disponibilidad': 'Disponibilidad de Árbitros'
  };
  return titles[option] || 'Reporte de Árbitros';
}

function getIngresosTitle(option) {
  const titles = {
    'listar-ingresos': 'Listado de Ingresos',
    'ingresos-totales': 'Ingresos Totales',
    'ingresos-categoria': 'Ingresos por Categoría',
    'ingresos-deporte': 'Ingresos por Deporte',
    'proyeccion': 'Proyección de Ingresos'
  };
  return titles[option] || 'Reporte de Ingresos';
}

function getProductosTitle(option) {
  const titles = {
    'listar-productos': 'Listado de Productos',
    'mas-vendidos': 'Productos Más Vendidos',
    'bajo-stock': 'Productos con Bajo Stock',
    'productos-categoria': 'Productos por Categoría',
    'rentabilidad': 'Rentabilidad de Productos'
  };
  return titles[option] || 'Reporte de Productos';
}

function getEquiposTitle(option) {
  const titles = {
    'listar-equipos': 'Listado de Equipos',
    'mas-activos': 'Equipos Más Activos',
    'equipos-deporte': 'Equipos por Deporte',
    'equipos-torneos': 'Equipos en Torneos'
  };
  return titles[option] || 'Reporte de Equipos';
}

function getPartidosTitle(option) {
  const titles = {
    'listar-partidos': 'Listado de Partidos',
    'partidos-estado': 'Partidos por Estado',
    'partidos-deporte': 'Partidos por Deporte',
    'partidos-torneo': 'Partidos de Torneo',
    'estadisticas': 'Estadísticas de Partidos'
  };
  return titles[option] || 'Reporte de Partidos';
}

function getReservasTitle(option) {
  const titles = {
    'listar-reservas': 'Listado de Reservas',
    'reservas-estado': 'Reservas por Estado',
    'cancelaciones': 'Cancelaciones',
    'reservas-deporte': 'Reservas por Deporte',
    'reservas-dia': 'Reservas por Día de Semana',
    'duracion-promedio': 'Duración Promedio de Reservas'
  };
  return titles[option] || 'Reporte de Reservas';
}

function getSedesTitle(option) {
  const titles = {
    'listar-sedes': 'Listado de Sedes',
    'mas-utilizadas': 'Sedes Más Utilizadas',
    'sedes-ciudad': 'Sedes por Ciudad',
    'ingresos-sede': 'Ingresos por Sede'
  };
  return titles[option] || 'Reporte de Sedes';
}

function getTorneosTitle(option) {
  const titles = {
    'listar-torneos': 'Listado de Torneos',
    'torneos-activos': 'Torneos Activos',
    'torneos-deporte': 'Torneos por Deporte',
    'equipos-torneo': 'Equipos por Torneo',
    'estadisticas': 'Estadísticas de Torneos'
  };
  return titles[option] || 'Reporte de Torneos';
}

function getUsuariosTitle(option) {
  const titles = {
    'listar-usuarios': 'Listado de Usuarios',
    'nuevos-usuarios': 'Nuevos Usuarios',
    'usuarios-frecuentes': 'Usuarios Frecuentes',
    'tasa-retencion': 'Tasa de Retención',
    'usuarios-deporte': 'Usuarios por Deporte',
    'usuarios-inactivos': 'Usuarios Inactivos'
  };
  return titles[option] || 'Reporte de Usuarios';
}

function getMonthName(month) {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1] || 'Mes Desconocido';
}
