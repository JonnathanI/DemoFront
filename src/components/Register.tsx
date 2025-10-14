import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { FaUser, FaEnvelope, FaLock, FaUserTag, FaCode } from 'react-icons/fa';
import '../styles/Register.css'; // Asegúrate de que esta ruta sea correcta

// Componente auxiliar para inputs
// NOTA: Eliminamos la lógica compleja de React.cloneElement con 'style' para evitar el TS2769
const InputField: React.FC<{ 
    name: string, 
    placeholder: string, 
    type: string, 
    icon: React.ReactElement,
    value: string,
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    required?: boolean
}> = ({ name, placeholder, type, icon, value, handleChange, required = false }) => (
    // Aplicamos la clase CSS del grupo para el posicionamiento del icono
    <div className="input-group-register">
        {/* El CSS se encargará de posicionar el SVG dentro de .input-group-register */}
        {icon} 
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            required={required}
            className="input-field-register"
        />
    </div>
);


const Register: React.FC = () => {
  const [data, setData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    adminCode: '', 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registerData = {
          username: data.username,
          email: data.email,
          password: data.password,
          fullName: data.fullName || undefined, 
          adminCode: data.adminCode || undefined, 
      }
      
      await register(registerData); 
      
      alert(`¡Registro exitoso! Ahora puedes iniciar sesión.`);
      navigate('/login');

    } catch (err: any) {
      setError(err.message || 'Fallo en el registro. Intenta con otro usuario o email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // CLASE CSS: auth-container-register
    <div className="auth-container-register">
      
      {/* CLASE CSS: auth-card-register */}
      <div className="auth-card-register">
        
        <h2>¡Únete al Desafío! ✨</h2>
        <p>Crea tu cuenta en segundos y empieza a jugar.</p>

        <form onSubmit={handleSubmit}>
          
          <InputField name="username" placeholder="Nombre de Usuario" type="text" icon={<FaUser />} value={data.username} handleChange={handleChange} required />
          <InputField name="email" placeholder="Email" type="email" icon={<FaEnvelope />} value={data.email} handleChange={handleChange} required />
          <InputField name="password" placeholder="Contraseña (mín. 6 car.)" type="password" icon={<FaLock />} value={data.password} handleChange={handleChange} required />
          <InputField name="fullName" placeholder="Nombre Completo (Opcional)" type="text" icon={<FaUserTag />} value={data.fullName} handleChange={handleChange} />
          
          {/* Sección de Administrador Opcional */}
          <div className="admin-section">
            <p className="admin-label">
              ¿Tienes un código de administrador? (Opcional)
            </p>
            <InputField name="adminCode" placeholder="Código de Super Usuario" type="text" icon={<FaCode />} value={data.adminCode} handleChange={handleChange} />
          </div>

          {/* Botón de Registrarme */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn-register" // CLASE CSS: btn-register
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>
        
        {/* Mensaje de Error */}
        {error && <p className="error-message">{error}</p>}

        {/* Enlace a Login */}
        <p className="link-login"> {/* CLASE CSS: link-login */}
          ¿Ya tienes cuenta? 
          <a href="/login">
            Inicia Sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;