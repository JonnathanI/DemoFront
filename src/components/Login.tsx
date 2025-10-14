import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import useAuthStore from '../store/authStore';
import { FaUserCircle, FaLock } from 'react-icons/fa';
import '../styles/Login.css'; // 💡 Importación del CSS tradicional

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
      authLogin(response); 
      navigate('/dashboard'); 

    } catch (err: any) {
      setError(err.message || 'Fallo al iniciar sesión. Verifica tu usuario/email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Usa la clase CSS del contenedor
    <div className="auth-container-login">
      
      {/* Usa la clase CSS de la tarjeta */}
      <div className="auth-card">
        
        <h2>¡Bienvenido de vuelta! 🚀</h2>
        <p>Inicia sesión y sigue mejorando tu inglés.</p>

        <form onSubmit={handleSubmit}>
          
          {/* Campo Usuario/Email */}
          <div className="input-group">
            <FaUserCircle />
            <input
              type="text"
              placeholder="Usuario o Email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>

          {/* Campo Contraseña */}
          <div className="input-group">
            <FaLock />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>

          {/* Botón de Entrar */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn-login"
          >
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>
        
        {/* Mensaje de Error */}
        {error && <p className="error-message">{error}</p>}
        
        {/* Enlace a Registro */}
        <p className="link-register">
          ¿No tienes cuenta? 
          <a href="/register">
            ¡Regístrate aquí!
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;