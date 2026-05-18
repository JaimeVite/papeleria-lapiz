import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";

const API_URL = "http://localhost:8000/api/productos/";

// 🏠 LANDING PAGE
const HomePage = () => (
  <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
    <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white py-20 px-6 text-center overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">Papelería "El Lápiz Dorado"</h1>
        <p className="text-lg md:text-xl text-blue-100 mb-8">Tradición, innovación y eficiencia desde 1998</p>
        <Link to="/inventario" className="inline-block bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300">
           Ir al Sistema de Inventario
        </Link>
      </div>
    </header>
    <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">📜 Nuestra Historia</h2>
        <p className="text-gray-600 leading-relaxed">
          Fundada en 1998, <strong>Papelería El Lápiz Dorado</strong> nació como un pequeño negocio familiar con el objetivo de proveer materiales de calidad. A lo largo de 25 años, hemos evolucionado incorporando tecnología de gestión para optimizar nuestro inventario, reducir mermas y ofrecer un servicio ágil. Hoy digitalizamos nuestros procesos para mantenernos a la vanguardia.
        </p>
      </div>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2"> Misión</h3>
          <p className="text-gray-600">Brindar soluciones de papelería con calidad, precio justo y atención personalizada, apoyados en herramientas digitales que garanticen eficiencia operativa.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2"> Visión</h3>
          <p className="text-gray-600">Ser la papelería líder en gestión tecnológica en la región, reconocida por su innovación y compromiso con la comunidad educativa y empresarial.</p>
        </div>
      </div>
    </section>
    <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
      <p>© {new Date().getFullYear()} Papelería El Lápiz Dorado • Desarrollo EC0727</p>
    </footer>
  </div>
);

// 📦 INVENTORY PAGE
const InventoryPage = () => {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ nombre: "", precio: "", stock: "", categoria_id: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchProductos = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error de conexión");
      setProductos(await res.json());
    } catch (err) {
      setMsg({ type: "error", text: "No se pudo cargar el inventario." });
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => { fetchProductos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const cleanData = {
        nombre: form.nombre.trim(),
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock) || 0
      };
      if (form.categoria_id && /^\d+$/.test(form.categoria_id)) {
        cleanData.categoria_id = parseInt(form.categoria_id);
      }
      if (!cleanData.nombre || isNaN(cleanData.precio)) throw new Error("Nombre y precio obligatorios");

      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_URL}${editId}/` : API_URL;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(cleanData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en el servidor");

      setMsg({ type: "success", text: editId ? "✅ Producto actualizado" : "✅ Producto creado" });
      setForm({ nombre: "", precio: "", stock: "", categoria_id: "" });
      setEditId(null);
      fetchProductos();
    } catch (err) {
      setMsg({ type: "error", text: "❌ " + err.message });
    } finally {
      // 🔑 FIX: SIEMPRE se ejecuta, liberando el botón
      setLoading(false);
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({ nombre: p.nombre, precio: String(p.precio), stock: String(p.stock), categoria_id: p.categoria_id || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar registro?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setMsg({ type: "success", text: "🗑️ Eliminado correctamente" });
      fetchProductos();
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    }
  };

  return (
    <div className="min-h-screen pb-10 relative overflow-hidden bg-gray-50">
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-6 transition-colors">← Volver al Inicio</Link>

        <header className="text-center mb-10 fade-in-up">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-2">📦 Inventario Smart</h1>
          <p className="text-gray-500">Sistema de gestión dinámica y responsiva</p>
        </header>

        {msg.text && (
          <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-lg shadow-lg border-l-4 text-sm font-bold fade-in-up ${msg.type === 'success' ? 'bg-white text-green-600 border-green-500' : 'bg-white text-red-600 border-red-500'}`}>{msg.text}</div>
        )}

        <section className="glass-panel p-6 mb-10 fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700">{editId ? "✏️ Modificar Producto" : "➕ Agregar Nuevo"}</h2>
            {editId && <button onClick={() => { setEditId(null); setForm({ nombre: "", precio: "", stock: "", categoria_id: "" }); }} className="text-xs text-gray-400 hover:text-red-500 underline">Cancelar</button>}
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-5">
            <div className="md:col-span-1"><label className="text-xs font-bold text-gray-400 uppercase ml-1">Nombre</label><input name="nombre" value={form.nombre} onChange={(e)=>setForm({...form, nombre:e.target.value})} className="input-dynamic" placeholder="Ej. Papel Bond" required disabled={loading} /></div>
            <div className="md:col-span-1"><label className="text-xs font-bold text-gray-400 uppercase ml-1">Precio</label><input name="precio" type="number" step="0.01" value={form.precio} onChange={(e)=>setForm({...form, precio:e.target.value})} className="input-dynamic" placeholder="0.00" required disabled={loading} /></div>
            <div className="md:col-span-1"><label className="text-xs font-bold text-gray-400 uppercase ml-1">Stock</label><input name="stock" type="number" value={form.stock} onChange={(e)=>setForm({...form, stock:e.target.value})} className="input-dynamic" placeholder="10" disabled={loading} /></div>
            <div className="md:col-span-1"><label className="text-xs font-bold text-gray-400 uppercase ml-1">Cat. ID</label><input name="categoria_id" type="number" value={form.categoria_id} onChange={(e)=>setForm({...form, categoria_id:e.target.value})} className="input-dynamic" placeholder="Opcional" disabled={loading} /></div>
            <div className="md:col-span-1 flex items-end"><button type="submit" disabled={loading} className={`btn-primary ${loading ? 'opacity-70' : ''}`}>{loading ? (editId ? "Guardando..." : "Creando...") : (editId ? "💾 Guardar" : "✨ Crear")}</button></div>
          </form>
        </section>

        <section className="glass-panel overflow-hidden fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-bold text-gray-600">📋 Registros Actuales ({productos.length})</h2>
            {loading && !initialLoad && <span className="text-xs text-slate-400 animate-pulse">Sincronizando...</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-400 uppercase bg-gray-50/80">
                  <th className="px-6 py-3 font-semibold">ID</th><th className="px-6 py-3 font-semibold">Producto</th><th className="px-6 py-3 font-semibold">Precio</th><th className="px-6 py-3 font-semibold">Stock</th><th className="px-6 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {initialLoad ? (
                  [1,2,3].map(i => (<tr key={i}><td className="px-6 py-4"><div className="h-4 w-8 loading-skeleton rounded"></div></td><td className="px-6 py-4"><div className="h-4 w-32 loading-skeleton rounded"></div></td><td className="px-6 py-4"><div className="h-4 w-16 loading-skeleton rounded"></div></td><td className="px-6 py-4"><div className="h-4 w-10 loading-skeleton rounded"></div></td><td className="px-6 py-4"><div className="h-4 w-20 loading-skeleton rounded"></div></td></tr>))
                ) : productos.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-400"><span className="text-4xl block mb-2">📂</span>No hay productos registrados.</td></tr>
                ) : (
                  productos.map((p) => (
                    <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors duration-200 group">
                      <td className="px-6 py-4 text-gray-400 font-mono text-sm">#{p.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-700">{p.nombre}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">${Number(p.precio).toFixed(2)}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{p.stock} u.</span></td>
                      <td className="px-6 py-4 text-right space-x-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(p)} className="btn-secondary hover:bg-indigo-200 hover:text-indigo-700">Editar</button>
                        <button onClick={() => handleDelete(p.id)} className="btn-secondary hover:bg-red-200 hover:text-red-700">️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/inventario" element={<InventoryPage />} />
    </Routes>
  );
}