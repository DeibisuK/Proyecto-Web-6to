import React from 'react';

const PruebaReact: React.FC = () => {
  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center' }}>Carrito de Compras</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
      <li style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <span>Producto 1</span>
        <span>$10</span>
      </li>
      <li style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <span>Producto 2</span>
        <span>$15</span>
      </li>
      <li style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <span>Producto 3</span>
        <span>$8</span>
      </li>
      </ul>
      <hr />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: 16 }}>
      <span>Total:</span>
      <span>$33</span>
      </div>
      <button
      style={{
        width: '100%',
        marginTop: 24,
        padding: '10px 0',
        background: '#1976d2',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 16
      }}
      onClick={() => alert('Compra realizada')}
      >
      Comprar
      </button>
    </div>
  );
};

export default PruebaReact;
