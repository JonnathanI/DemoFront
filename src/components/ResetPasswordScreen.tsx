import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService'; // 💡 Importamos la nueva función
import { FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/Login.css'; // Reutilizamos estilos si aplican

const ResetPasswordScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 1. Obtener el token de la URL (query param: ?token=XYZ)
  const token = searchParams.get('token'); 

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mensaje inicial si el token no existe
  useEffect(() => {
    if (!token) {
      setError('Error: No se encontró el token de recuperación en la URL.');
    }
  }, [token]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!token) {
      setError('Fallo: El token de recuperación es nulo o inválido.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
    }

    try {
      const successMessage = await resetPassword({ token, newPassword });
      
      setMessage(successMessage);
      
      // Redirigir al usuario al login después de un breve retraso
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      // Captura el error específico del backend (token expirado/inválido)
      setError(err.message || 'Fallo al restablecer la contraseña. Revisa el token o intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    // Mostrar un mensaje de error si el token no está en la URL
    return (
      <div className="auth-container-login">
        <div className="auth-card">
          <h2><FaExclamationTriangle color="#f00" /> Error de Acceso</h2>
          <p className="error-message">Token de recuperación faltante o URL inválida.</p>
          <p>Por favor, usa el enlace completo que recibiste por correo electrónico.</p>
          <button onClick={() => navigate('/forgot-password')} className="btn-login">
            Solicitar Nuevo Enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container-login">
      <div className="auth-card">
        
        <h2>Establecer Nueva Contraseña 🔑</h2>
        <p>Ingresa y confirma tu nueva contraseña.</p>

        <form onSubmit={handleSubmit}>
          
          {/* Campo Nueva Contraseña */}
          <div className="input-group">
            <FaLock />
            <input
              type="password"
              placeholder="Nueva Contraseña (mín. 6 car.)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>

          {/* Campo Confirmar Contraseña */}
          <div className="input-group">
            <FaLock />
            <input
              type="password"
              placeholder="Confirma Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>

          {/* Botón de Restablecer */}
          <button 
            type="submit" 
            disabled={loading || !!error || !token}
            className="btn-login"
          >
            {loading ? 'Cargando...' : 'Restablecer Contraseña'}
          </button>
        </form>
        
        {/* Mensajes de Estado */}
        {message && <p className="success-message"><FaCheckCircle /> {message}</p>}
        {error && <p className="error-message"><FaExclamationTriangle /> {error}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordScreen;