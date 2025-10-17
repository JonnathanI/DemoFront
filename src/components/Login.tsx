import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 💡 IMPORTAR LA FUNCIÓN NUEVA
import { login, loginWithGoogle } from '../services/authService';
import useAuthStore from '../store/authStore';
// 💡 IMPORTS AÑADIDOS PARA GOOGLE
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'; 
import { FaUserCircle, FaLock } from 'react-icons/fa';
import '../styles/Login.css'; // 💡 Importación del CSS tradicional

const Login: React.FC = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const authLogin = useAuthStore((state) => state.login);

    // --- Lógica de Login Normal (EXISTENTE) ---
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

    // ==========================================================
    // 💡 LÓGICA DE LOGIN CON GOOGLE (NUEVA)
    // ==========================================================
    const handleGoogleSuccess = async (response: CredentialResponse) => {
        const googleCredential = response.credential;
        if (!googleCredential) {
            setError('Error: No se recibió credencial de Google.');
            return;
        }
        // Usamos el mismo estado de carga para ambos logins
        setLoading(true); 
        setError('');

        try {
            const authResponse = await loginWithGoogle(googleCredential);
            authLogin(authResponse);
            navigate('/dashboard'); 
        } catch (err: any) {
            setError(err.message || 'Fallo la autenticación con Google. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleFailure = () => {
        setError('El inicio de sesión con Google falló.');
    };

    // --- RENDERIZADO DEL COMPONENTE ---
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
                
                {/* Separador "O" */}
                <div className="separator-text">O</div>
                
                {/* 💡 BOTÓN DE GOOGLE (AÑADIDO) */}
                <div className="google-login-wrapper">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                        theme="outline" 
                        text="continue_with"
                        shape="square" 
                        width="100%" 
                        type="standard"
                    />
                </div>
                
                {/* 🔑 ENLACE A RECUPERACIÓN DE CONTRASEÑA */}
                <p className="link-forgot-password">
                    <a href="/forgot-password">
                        ¿Olvidaste tu contraseña?
                    </a>
                </p>

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