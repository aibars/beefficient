export default function Header() {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <h1 className="logo">Beefficient</h1>
            <ul className="nav-links">
              <li><a href="#features">Características</a></li>
              <li><a href="#pricing">Precios</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contacto</a></li>
            </ul>
            <div className="nav-actions">
              <a href="https://app.beefficient.local" className="btn btn-secondary">
                Ingresar
              </a>
              <a href="https://app.beefficient.local/register" className="btn btn-primary">
                Registrarse
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
