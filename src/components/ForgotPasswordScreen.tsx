import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/authService'; // 💡 Importamos la nueva función
import { FaEnvelope, FaChevronLeft } from 'react-icons/fa';
import '../styles/Login.css'; // Reutilizamos estilos si aplican

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const successMessage = await forgotPassword(email);
      // El backend siempre devuelve un mensaje de éxito genérico por seguridad.
      setMessage(successMessage); 

    } catch (err: any) {
      // Manejar errores de red o errores específicos del servidor.
      setError(err.message || 'Ocurrió un error. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Reutilizamos el contenedor de login
    <div className="auth-container-login"> 
      
      <div className="auth-card">
        
        <h2>¿Olvidaste tu Contraseña? 🔒</h2>
        <p>Ingresa tu email para recibir el enlace de recuperación.</p>

        <form onSubmit={handleSubmit}>
          
          {/* Campo Email */}
          <div className="input-group">
            <FaEnvelope />
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>

          {/* Botón de Enviar */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn-login"
          >
            {loading ? 'Enviando...' : 'Enviar Enlace'}
          </button>
        </form>
        
        {/* Mensajes de Estado */}
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        
        {/* Enlace para volver al Login */}
        <p className="link-register">
          <a href="/login" className="back-link">
            <FaChevronLeft style={{ marginRight: '5px' }} />
            Volver a Iniciar Sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;