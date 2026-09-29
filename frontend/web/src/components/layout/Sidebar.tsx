import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import './Sidebar.css';

export default function Sidebar() {
  const { sidebarOpen } = useAppStore();

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <nav className="nav">
        <Link to="/" className="nav-link">
          Inicio
        </Link>
        <Link to="/establishments" className="nav-link">
          Establecimientos
        </Link>
        <Link to="/reports" className="nav-link">
          Reportes
        </Link>
        <Link to="/settings" className="nav-link">
          Configuración
        </Link>
      </nav>
    </aside>
  );
}
