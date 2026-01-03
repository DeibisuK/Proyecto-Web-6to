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
        p.id_producto AS "ID",
        p.nombre AS "Producto",
        c.nombre_categoria AS "Categoría",
        d.nombre_deporte AS "Deporte",
        m.nombre_marca AS "Marca",
        COUNT(DISTINCT vp.id_variante) AS "Variantes",
        MIN(vp.precio) AS "Precio Mínimo",
        MAX(vp.precio) AS "Precio Máximo",
        SUM(vp.stock) AS "Stock Total",
        CASE WHEN p.es_nuevo THEN 'Nuevo' ELSE 'Regular' END AS "Estado"
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN deportes d ON p.id_deporte = d.id_deporte
      LEFT JOIN marcas m ON p.id_marca = m.id_marca
      LEFT JOIN variantes_productos vp ON p.id_producto = vp.id_producto
      GROUP BY p.id_producto, p.nombre, c.nombre_categoria, d.nombre_deporte, m.nombre_marca, p.es_nuevo
      ORDER BY p.nombre
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["ID", "Producto", "Categoría", "Deporte", "Marca", "Variantes", "Precio Mínimo", "Precio Máximo", "Stock Total", "Estado"],
      rows: result.rows,
      summary: {
        'Total de Productos': result.rows.length,
        'Productos Nuevos': result.rows.filter(r => r.Estado === 'Nuevo').length
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
  try {
    const query = `
      SELECT 
        p.nombre AS "Producto",
        c.nombre_categoria AS "Categoría",
        d.nombre_deporte AS "Deporte",
        SUM(dp.cantidad) AS "Unidades Vendidas",
        COALESCE(SUM(dp.cantidad * dp.precio_venta), 0) AS "Ingresos Generados",
        ROUND(AVG(dp.precio_venta), 2) AS "Precio Promedio Venta"
      FROM detalle_pedidos dp
      JOIN variantes_productos vp ON dp.id_variante = vp.id_variante
      JOIN productos p ON vp.id_producto = p.id_producto
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN deportes d ON p.id_deporte = d.id_deporte
      JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
      WHERE EXTRACT(YEAR FROM ped.fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND ped.estado_pedido = 'Entregado'
      GROUP BY p.id_producto, p.nombre, c.nombre_categoria, d.nombre_deporte
      ORDER BY SUM(dp.cantidad) DESC
      LIMIT 20
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Producto", "Categoría", "Deporte", "Unidades Vendidas", "Ingresos Generados", "Precio Promedio Venta"],
      rows: result.rows,
      summary: {
        'Total Productos': result.rows.length,
        'Unidades Totales': result.rows.reduce((sum, r) => sum + parseInt(r['Unidades Vendidas'] || 0), 0),
        'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r['Ingresos Generados'] || 0), 0).toFixed(2)}`
      }
    };
  } catch (error) {
    console.error('Error en productosMasVendidos:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al obtener productos más vendidos" }],
      summary: { 'Estado': 'Error' }
    };
  }
}

async function productosBajoStock() {
  try {
    const query = `
      SELECT 
        p.nombre AS "Producto",
        vp.sku AS "SKU",
        vp.stock AS "Stock Actual",
        c.nombre_categoria AS "Categoría",
        d.nombre_deporte AS "Deporte",
        vp.precio AS "Precio",
        CASE 
          WHEN vp.stock = 0 THEN '🔴 Agotado'
          WHEN vp.stock <= 5 THEN '🟠 Crítico'
          WHEN vp.stock <= 10 THEN '🟡 Bajo'
          ELSE '🟢 Normal'
        END AS "Estado Stock"
      FROM variantes_productos vp
      JOIN productos p ON vp.id_producto = p.id_producto
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN deportes d ON p.id_deporte = d.id_deporte
      WHERE vp.stock <= 10
      ORDER BY vp.stock ASC, p.nombre
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Producto", "SKU", "Stock Actual", "Categoría", "Deporte", "Precio", "Estado Stock"],
      rows: result.rows,
      summary: {
        'Productos con Bajo Stock': result.rows.length,
        'Productos Agotados': result.rows.filter(r => r['Stock Actual'] === 0).length,
        'Productos Críticos': result.rows.filter(r => r['Stock Actual'] > 0 && r['Stock Actual'] <= 5).length
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
        COUNT(DISTINCT p.id_producto) AS "Total Productos",
        COUNT(DISTINCT vp.id_variante) AS "Total Variantes",
        SUM(vp.stock) AS "Stock Total",
        ROUND(AVG(vp.precio)::numeric, 2) AS "Precio Promedio",
        COALESCE(SUM(dp.cantidad), 0) AS "Unidades Vendidas",
        COALESCE(SUM(dp.cantidad * dp.precio_venta), 0) AS "Ingresos"
      FROM categorias c
      LEFT JOIN productos p ON c.id_categoria = p.id_categoria
      LEFT JOIN variantes_productos vp ON p.id_producto = vp.id_producto
      LEFT JOIN detalle_pedidos dp ON vp.id_variante = dp.id_variante
      LEFT JOIN pedidos ped ON dp.id_pedido = ped.id_pedido 
        AND ped.estado_pedido = 'Entregado'
        AND EXTRACT(YEAR FROM ped.fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY c.id_categoria, c.nombre_categoria
      ORDER BY COALESCE(SUM(dp.cantidad * dp.precio_venta), 0) DESC
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Categoría", "Total Productos", "Total Variantes", "Stock Total", "Precio Promedio", "Unidades Vendidas", "Ingresos"],
      rows: result.rows,
      summary: {
        'Total de Categorías': result.rows.length,
        'Productos Totales': result.rows.reduce((sum, r) => sum + parseInt(r['Total Productos'] || 0), 0),
        'Ingresos Totales': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Ingresos || 0), 0).toFixed(2)}`
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
  try {
    const query = `
      SELECT 
        p.nombre AS "Producto",
        c.nombre_categoria AS "Categoría",
        SUM(dp.cantidad) AS "Unidades Vendidas",
        ROUND(AVG(vp.precio)::numeric, 2) AS "Precio Base",
        ROUND(AVG(dp.precio_venta), 2) AS "Precio Venta Promedio",
        COALESCE(SUM(dp.cantidad * dp.precio_venta), 0) AS "Ingresos Totales",
        COALESCE(SUM(dp.cantidad * vp.precio), 0) AS "Costo Base",
        COALESCE(SUM(dp.cantidad * dp.precio_venta) - SUM(dp.cantidad * vp.precio), 0) AS "Ganancia",
        ROUND(
          (((COALESCE(SUM(dp.cantidad * dp.precio_venta), 0) - COALESCE(SUM(dp.cantidad * vp.precio), 0)) * 100.0) / 
          NULLIF(COALESCE(SUM(dp.cantidad * vp.precio), 0), 0))::numeric,
          2
        ) AS "% Margen"
      FROM detalle_pedidos dp
      JOIN variantes_productos vp ON dp.id_variante = vp.id_variante
      JOIN productos p ON vp.id_producto = p.id_producto
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
      WHERE EXTRACT(YEAR FROM ped.fecha_pedido) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND ped.estado_pedido = 'Entregado'
      GROUP BY p.id_producto, p.nombre, c.nombre_categoria
      HAVING SUM(dp.cantidad) > 0
      ORDER BY (COALESCE(SUM(dp.cantidad * dp.precio_venta), 0) - COALESCE(SUM(dp.cantidad * vp.precio), 0)) DESC
      LIMIT 20
    `;
    
    const result = await pool.query(query);
    
    return {
      columns: ["Producto", "Categoría", "Unidades Vendidas", "Precio Base", "Precio Venta Promedio", "Ingresos Totales", "Costo Base", "Ganancia", "% Margen"],
      rows: result.rows,
      summary: {
        'Total Productos': result.rows.length,
        'Ganancia Total': `$${result.rows.reduce((sum, r) => sum + parseFloat(r.Ganancia || 0), 0).toFixed(2)}`,
        'Margen Promedio': `${(result.rows.reduce((sum, r) => sum + parseFloat(r['% Margen'] || 0), 0) / (result.rows.length || 1)).toFixed(2)}%`
      }
    };
  } catch (error) {
    console.error('Error en rentabilidadProductos:', error);
    return {
      columns: ["Nota"],
      rows: [{ "Nota": "Error al calcular rentabilidad de productos" }],
      summary: { 'Estado': 'Error' }
    };
  }
}
