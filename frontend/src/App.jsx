import { useState, useEffect } from 'react';

// URLs de la API (cambia esto por tu URL real de Render)
const API_PRODUCTOS = "https://papeleria-api-moat.onrender.com/api/productos/";
const API_CATEGORIAS = "https://papeleria-api-moat.onrender.com/api/categorias/";

function App() {
  const [vista, setVista] = useState('home'); // 'home' o 'inventario'
  
  // Estados para productos
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  
  // Estados para categorías
  const [categorias, setCategorias] = useState([]);
  
  // Estados para notificaciones
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState(''); // 'success' o 'error'

  // Cargar productos y categorías al iniciar
  useEffect(() => {
    if (vista === 'inventario') {
      cargarProductos();
      cargarCategorias();
    }
  }, [vista]);

  // Función para cargar productos
  const cargarProductos = () => {
    fetch(API_PRODUCTOS)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => {
        console.error("Error cargando productos:", err);
        mostrarMensaje("No se pudo cargar el inventario.", 'error');
      });
  };

  // Función para cargar categorías
  const cargarCategorias = () => {
    fetch(API_CATEGORIAS)
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error("Error cargando categorías:", err));
  };

  // Función para mostrar mensajes
  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(''), 3000);
  };

  // Función para crear o actualizar producto
  const handleGuardar = () => {
    if (!nombre || !precio || !stock) {
      mostrarMensaje("Por favor completa todos los campos obligatorios.", 'error');
      return;
    }

    const productoData = {
      nombre: nombre,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      categoria_id: categoriaId ? parseInt(categoriaId) : null
    };

    const metodo = editandoId ? 'PUT' : 'POST';
    const url = editandoId ? `${API_PRODUCTOS}${editandoId}/` : API_PRODUCTOS;

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoData)
    })
    .then(res => res.json())
    .then(data => {
      mostrarMensaje(editandoId ? "Producto actualizado exitosamente." : "Producto creado exitosamente.", 'success');
      limpiarFormulario();
      cargarProductos();
    })
    .catch(err => {
      console.error("Error:", err);
      mostrarMensaje("Error al guardar el producto.", 'error');
    });
  };

  // Función para editar producto
  const handleEditar = (producto) => {
    setEditandoId(producto.id);
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setStock(producto.stock);
    setCategoriaId(producto.categoria_id || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para eliminar producto
  const handleEliminar = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      fetch(`${API_PRODUCTOS}${id}/`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
          mostrarMensaje("Producto eliminado exitosamente.", 'success');
          cargarProductos();
        })
        .catch(err => {
          console.error("Error:", err);
          mostrarMensaje("Error al eliminar el producto.", 'error');
        });
    }
  };

  // Función para limpiar formulario
  const limpiarFormulario = () => {
    setNombre('');
    setPrecio('');
    setStock('');
    setCategoriaId('');
    setEditandoId(null);
  };

  // Obtener nombre de categoría por ID
  const obtenerNombreCategoria = (categoriaId) => {
    const categoria = categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  // ==================== PÁGINA DE INICIO ====================
  if (vista === 'home') {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
        {/* Header con gradiente */}
        <header style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #6B21A8 100%)',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Papelería "El Lápiz Dorado"
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
            Tradición, innovación y eficiencia desde 1998
          </p>
          <button
            onClick={() => setVista('inventario')}
            style={{
              backgroundColor: 'white',
              color: '#1E3A8A',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            Ir al Sistema de Inventario
          </button>
        </header>

        {/* Sección informativa */}
        <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Nuestra Historia */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ color: '#1E3A8A', marginBottom: '1rem' }}>📖 Nuestra Historia</h2>
              <p style={{ color: '#6B7280', lineHeight: '1.6' }}>
                Fundada en 1998, Papelería El Lápiz Dorado nació como un pequeño negocio familiar con el objetivo de ofrecer materiales de calidad. A lo largo de 26 años, nos hemos convertido en un referente de confianza para estudiantes, docentes y profesionales.
              </p>
            </div>

            {/* Misión */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ color: '#1E3A8A', marginBottom: '1rem' }}> Misión</h2>
              <p style={{ color: '#6B7280', lineHeight: '1.6' }}>
                Brindar soluciones de papelería con calidad, precio justo y atención personalizada, apoyados en herramientas digitales que garanticen eficiencia operativa y satisfacción del cliente.
              </p>
            </div>

            {/* Visión */}
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ color: '#1E3A8A', marginBottom: '1rem' }}>🌟 Visión</h2>
              <p style={{ color: '#6B7280', lineHeight: '1.6' }}>
                Ser la papelería líder en la región, reconocida por nuestra innovación tecnológica, servicio excepcional y compromiso con la educación y el desarrollo profesional de nuestra comunidad.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ backgroundColor: '#1F2937', color: 'white', textAlign: 'center', padding: '2rem', marginTop: '4rem' }}>
          <p>&copy; 2024 Papelería El Lápiz Dorado. Todos los derechos reservados.</p>
        </footer>
      </div>
    );
  }

  // ==================== SISTEMA DE INVENTARIO ====================
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      {/* Notificación */}
      {mensaje && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: tipoMensaje === 'success' ? '#10B981' : '#EF4444',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          {mensaje}
        </div>
      )}

      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '1.5rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setVista('home')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#1E3A8A',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Volver al Inicio
        </button>
        <h1 style={{ color: '#1E3A8A', fontSize: '2rem', fontWeight: 'bold' }}>
          📦 Inventario Smart
        </h1>
        <div style={{ width: '120px' }}></div>
      </header>

      {/* Contenido principal */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        
        {/* Formulario de alta */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h2 style={{ color: '#1E3A8A', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            {editandoId ? '✏️ Editar Producto' : '➕ Agregar Nuevo'}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Campo Nombre */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>
                NOMBRE *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Papel Bond"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Campo Precio */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>
                PRECIO *
              </label>
              <input
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Campo Stock */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>
                STOCK *
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Campo Categoría (Dropdown) */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>
                CATEGORÍA
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="">-- Selecciona una categoría --</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleGuardar}
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                padding: '0.75rem 2rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {editandoId ? '💾 Actualizar' : '✨ Crear'}
            </button>
            {editandoId && (
              <button
                onClick={limpiarFormulario}
                style={{
                  backgroundColor: '#6B7280',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Tabla de productos */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#1E3A8A', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            📋 Registros Actuales ({productos.length})
          </h2>
          
          {productos.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
              No hay productos registrados. ¡Agrega el primero!
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F3F4F6' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E5E7EB' }}>ID</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E5E7EB' }}>PRODUCTO</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E5E7EB' }}>PRECIO</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E5E7EB' }}>STOCK</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E5E7EB' }}>CATEGORÍA</th>
                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #E5E7EB' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '1rem', color: '#6B7280' }}>#{producto.id}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1F2937' }}>{producto.nombre}</td>
                      <td style={{ padding: '1rem', color: '#10B981', fontWeight: 'bold' }}>${producto.precio}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          backgroundColor: producto.stock > 10 ? '#D1FAE5' : '#FEE2E2',
                          color: producto.stock > 10 ? '#065F46' : '#991B1B',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          {producto.stock} u.
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6B7280' }}>
                        {obtenerNombreCategoria(producto.categoria_id)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => handleEditar(producto)}
                          style={{
                            backgroundColor: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '0.5rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          ️ Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(producto.id)}
                          style={{
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;