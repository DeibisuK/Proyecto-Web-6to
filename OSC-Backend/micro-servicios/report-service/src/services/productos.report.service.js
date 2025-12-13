import pool from '../config/db.js';

// Plantilla básica - Algunas queries pueden fallar si no existen tablas necesarias
export async function getReportData(option, filters = {}) {
  const { year, month } = filters;
  
  switch (option) {
    case 'listar-productos':
      return await listarProductos();
    case 'mas-vendidos':
      return await productosMasVendidos(year, month);
    case 'bajo-stock':
      return await productosBajoStock();
    case 'productos-categoria':
      return await productosPorCategoria();
    case 'rentabilidad':
      return await rentabilidadProductos(year, month);
    default:
      throw new Error(`Opción no válida: ${option}`);
  }
}

async function listarProductos() {
  try {
    const query = `
      SELECT 
        p.nombre AS "Producto",
        c.nombre_categoria AS "Categoría",
        m.nombre_marca AS "Marca",
        d.nombre_deporte AS "Deporte"
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN marcas m ON p.id_marca = m.id_marca
      LEFT JOIN deportes d ON p.id_deporte = d.id_deporte
      ORDER BY p.nombre
      LIMIT 500
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Producto", "Categoría", "Marca", "Deporte"],
      rows: result.rows,
      summary: {
        'Total de Productos': result.rows.length
      }
    };
  } catch (error) {
    console.error('Error en listarProductos:', error);
    return {
      columns: ["Info"],
      rows: [{ "Info": "Error al obtener productos" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function productosMasVendidos(year, month) {
  return {
    columns: ["Nota"],
    rows: [{ "Nota": "Reporte pendiente - requiere integración con sistema de ventas" }],
    summary: { 'Estado': 'En desarrollo' }
  };
}

async function productosBajoStock() {
  try {
    const query = `
      SELECT 
        vp.sku AS "SKU",
        p.nombre AS "Producto",
        c.nombre_categoria AS "Categoría",
        vp.stock AS "Stock Actual",
        vp.estado AS "Estado"
      FROM variantes_productos vp
      INNER JOIN productos p ON vp.id_producto = p.id_producto
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE vp.stock < 10 AND vp.estado = 'Activo'
      ORDER BY vp.stock ASC
      LIMIT 100
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["SKU", "Producto", "Categoría", "Stock Actual", "Estado"],
      rows: result.rows,
      summary: {
        'Productos con Bajo Stock': result.rows.length
      }
    };
  } catch (error) {
    console.error('Error en productosBajoStock:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener productos con bajo stock" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function productosPorCategoria() {
  try {
    const query = `
      SELECT 
        c.nombre_categoria AS "Categoría",
        COUNT(p.id_producto) AS "Total Productos"
      FROM categorias c
      LEFT JOIN productos p ON c.id_categoria = p.id_categoria
      GROUP BY c.id_categoria, c.nombre_categoria
      ORDER BY COUNT(p.id_producto) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Categoría", "Total Productos"],
      rows: result.rows,
      summary: {
        'Total de Categorías': result.rows.length,
        'Productos Totales': result.rows.reduce((sum, r) => sum + parseInt(r['Total Productos'] || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error en productosPorCategoria:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener productos por categoría" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function rentabilidadProductos(year, month) {
  return {
    columns: ["Nota"],
    rows: [{ "Nota": "Reporte pendiente - requiere datos de costos y ventas" }],
    summary: { 'Estado': 'En desarrollo' }
  };
}
