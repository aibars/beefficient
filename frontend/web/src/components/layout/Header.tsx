import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useAppStore();

  return (
    <header className="header">
      <div className="header-content">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <h1 className="header-title">Beefficient</h1>
      </div>
      <div className="header-user">
        <span className="user-name">{user?.name}</span>
        <button className="logout-btn" onClick={logout}>
          Salir
        </button>
      </div>
    </header>
  );
}
