import pool from '../config/db.js';

export async function getReportData(option, filters = {}) {
  return {
    columns: ["Nota"],
    rows: [{ "Nota": "Reportes de torneos - Pendiente de implementación (módulo de torneos en desarrollo)" }],
    summary: { 'Estado': 'Pendiente' }
  };
}
