/**
 * Utilidades compartidas para los servicios de reportes
 */

/**
 * Helper para construir filtros de fecha dinámicamente
 * Si month es undefined/null, solo filtra por año
 * @param {number} year - Año a filtrar
 * @param {number|null} month - Mes a filtrar (1-12), o null para todos los meses
 * @param {string} dateColumn - Nombre de la columna de fecha (default: 'r.fecha_reserva')
 * @returns {Object} Objeto con whereClause y params
 */
export function buildDateFilters(year, month, dateColumn = 'r.fecha_reserva') {
  if (month !== undefined && month !== null) {
    return {
      whereClause: `AND EXTRACT(YEAR FROM ${dateColumn}) = $1 AND EXTRACT(MONTH FROM ${dateColumn}) = $2`,
      params: [year, month]
    };
  } else {
    return {
      whereClause: `AND EXTRACT(YEAR FROM ${dateColumn}) = $1`,
      params: [year]
    };
  }
}

/**
 * Construye un filtro WHERE para usar en subqueries
 * @param {number} year - Año a filtrar
 * @param {number|null} month - Mes a filtrar (1-12), o null para todos los meses
 * @param {string} dateColumn - Nombre de la columna de fecha
 * @returns {string} Cláusula WHERE para usar en subquery
 */
export function buildDateWhere(year, month, dateColumn = 'fecha_reserva') {
  if (month !== undefined && month !== null) {
    return `AND EXTRACT(YEAR FROM ${dateColumn}) = $1 AND EXTRACT(MONTH FROM ${dateColumn}) = $2`;
  } else {
    return `AND EXTRACT(YEAR FROM ${dateColumn}) = $1`;
  }
}

/**
 * Calcula las horas disponibles según el período
 * @param {number|null} month - Mes específico o null para todo el año
 * @param {number} horasPorDia - Horas disponibles por día (default: 12)
 * @param {number} diasPorMes - Días promedio por mes (default: 30)
 * @returns {number} Total de horas disponibles
 */
export function calculateAvailableHours(month, horasPorDia = 12, diasPorMes = 30) {
  // Si es un mes específico: diasPorMes * horasPorDia
  // Si es todo el año: diasPorMes * horasPorDia * 12 meses
  return month !== undefined && month !== null 
    ? diasPorMes * horasPorDia 
    : diasPorMes * horasPorDia * 12;
}

/**
 * Formatea un valor monetario
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado como moneda
 */
export function formatCurrency(value) {
  return `$${parseFloat(value || 0).toFixed(2)}`;
}

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado como porcentaje
 */
export function formatPercentage(value) {
  return `${parseFloat(value || 0).toFixed(2)}%`;
}
