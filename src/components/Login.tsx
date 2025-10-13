// src/components/Login.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import useAuthStore from '../store/authStore';

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const authLogin = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ usernameOrEmail, password });
      
      // Guardar el estado de autenticación
      authLogin(response); 
      
      // Redirigir al inicio o al dashboard del juego
      navigate('/dashboard'); 

    } catch (err: any) {
      setError(err.message || 'Fallo al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario o Email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <p>
        ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
      </p>
    </div>
  );
};

export default Login;