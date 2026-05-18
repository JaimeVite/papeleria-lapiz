// src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">Papelería "El Lápiz Dorado"</h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">Tradición, innovación y eficiencia desde 1998</p>
          <Link 
            to="/inventario" 
            className="inline-block bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300"
          >
             Ir al Sistema de Inventario
          </Link>
        </div>
      </header>

      {/* Historia y Misión */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">📜 Nuestra Historia</h2>
          <p className="text-gray-600 leading-relaxed">
            Fundada en 1998, <strong>Papelería El Lápiz Dorado</strong> nació como un pequeño negocio familiar con el objetivo de proveer materiales de calidad a estudiantes y oficinas locales. A lo largo de 25 años, hemos evolucionado incorporando tecnología de gestión para optimizar nuestro inventario, reducir mermas y ofrecer un servicio ágil y confiable. Hoy, digitalizamos nuestros procesos para mantenernos a la vanguardia del sector.
          </p>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🎯 Misión</h3>
            <p className="text-gray-600">Brindar soluciones de papelería y oficina con calidad, precio justo y atención personalizada, apoyados en herramientas digitales que garanticen eficiencia operativa.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🔭 Visión</h3>
            <p className="text-gray-600">Ser la papelería líder en gestión tecnológica en la región, reconocida por su innovación, sostenibilidad y compromiso con la comunidad educativa y empresarial.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} Papelería El Lápiz Dorado • Desarrollo EC0727</p>
      </footer>
    </div>
  );
}