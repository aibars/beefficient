interface AsyncStateProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/** Visible loading spinner / error message with retry. Renders nothing when idle. */
export function AsyncState({ loading, error, onRetry }: AsyncStateProps) {
  if (loading) {
    return (
      <div className="async-state" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <span>Cargando...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="async-state async-state--error" role="alert">
        <p>{error}</p>
        <button type="button" className="retry-button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    );
  }
  return null;
}
