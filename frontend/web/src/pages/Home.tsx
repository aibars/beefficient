import { useAuth } from '@/hooks/useAuth';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <h1>Bienvenido, {user?.name}</h1>
      <p>Eres un usuario: <strong>{user?.profileType === 'productor' ? 'Productor' : 'Técnico'}</strong></p>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Establecimiento</h2>
          <p>Gestiona tus propiedades y parcelas</p>
          <a href="/establishments" className="btn">Ver establecimientos</a>
        </div>

        <div className="card">
          <h2>Mercado</h2>
          <p>Precios y tendencias del sector</p>
          <a href="/market" className="btn">Consultar precios</a>
        </div>

        <div className="card">
          <h2>Noticias</h2>
          <p>Novedades e informes del sector</p>
          <a href="/news" className="btn">Leer noticias</a>
        </div>

        <div className="card">
          <h2>Calculadoras</h2>
          <p>Herramientas de cálculo y análisis</p>
          <a href="/tools" className="btn">Usar calculadoras</a>
        </div>
      </div>
    </div>
  );
}
