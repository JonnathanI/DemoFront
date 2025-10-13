// src/components/Register.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import useAuthStore from '../store/authStore';

const Register: React.FC = () => {
  const [data, setData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    adminCode: '', // Campo para el código de súper usuario
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const authLogin = useAuthStore((state) => state.login);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Crear objeto de registro limpiando el adminCode si está vacío
      const registerData = {
          username: data.username,
          email: data.email,
          password: data.password,
          fullName: data.fullName || undefined, // undefined si está vacío
          adminCode: data.adminCode || undefined, // undefined si está vacío
      }
      
      // Llamar al servicio de registro
      const response = await register(registerData); 
      
      // NOTA: Asumiendo que el backend te permite logearte inmediatamente después
      // y que la respuesta de registro incluye el token.
      // Si el backend no devuelve el token, deberías redirigir a Login y no llamar authLogin.
      
      // Por simplicidad (y asumiendo que el backend se ajustará o que te conformas con la User Entity)
      // Redirigimos al Login. Si quieres login automático, debes ajustar el backend.
      
      alert(`¡Registro exitoso! Usuario creado con rol: ${response.role || 'USER'}. Por favor, inicia sesión.`);
      navigate('/login');

    } catch (err: any) {
      setError(err.message || 'Fallo en el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Nombre de Usuario"
          value={data.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={data.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={data.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="fullName"
          placeholder="Nombre Completo (Opcional)"
          value={data.fullName}
          onChange={handleChange}
        />
        
        {/* Campo Opcional para Super Usuario */}
        <p style={{ marginTop: '15px', marginBottom: '5px', fontSize: '0.9em' }}>
            ¿Tienes un código de administrador? (Opcional)
        </p>
        <input
          type="text"
          name="adminCode"
          placeholder="Código de Super Usuario"
          value={data.adminCode}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading} style={{ marginTop: '20px' }}>
          {loading ? 'Registrando...' : 'Registrarme'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <p>
        ¿Ya tienes cuenta? <a href="/login">Inicia Sesión</a>
      </p>
    </div>
  );
};

export default Register;