'use client';

import React, { useState } from 'react';
import { ApiError } from '@/lib/api';
import * as authService from '@/services/auth.service';

interface LoginDialogProps {
  onSuccess: () => void;
}

/** Blocking full-screen login form. */
export function LoginDialog({ onSuccess }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await authService.login(email.trim(), password);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No se puede conectar al servidor',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dialog-backdrop login-backdrop" role="presentation">
      <form
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        onSubmit={handleSubmit}
      >
        <h2 id="login-title" className="dialog-title">
          Iniciar sesión
        </h2>
        <label htmlFor="login-email">Correo electrónico</label>
        <input
          id="login-email"
          className="search-input"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          className="search-input"
          type="password"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="login-error">
            {error}
          </p>
        )}
        <button type="submit" className="dialog-close" disabled={submitting}>
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
