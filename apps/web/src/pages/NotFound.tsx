import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <p>Página no encontrada</p>
        <Link to="/" className="btn-home">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
