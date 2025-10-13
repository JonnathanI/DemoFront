import React from 'react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css'; 
import { Navigate } from 'react-router-dom';

// 💡 Interfaz para aceptar la nueva propiedad
interface NavbarProps {
    isGameSession?: boolean; // True para ocultar Tienda y Jugar
}

// 💡 Aplicamos la propiedad con un valor por defecto de 'false'
const Navbar: React.FC<NavbarProps> = ({ isGameSession = false }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    // Aseguramos que el usuario exista
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 🐛 CORRECCIÓN: Evitar window.confirm() en este entorno.
    const handleLogout = () => {
        console.log("Cerrando sesión...");
        logout();
        navigate('/login');
    };

    const isAdmin = user.role === 'ADMIN';
    const usernameDisplay = user.username;

    return (
        <header className="navbar-header">
            {/* Logo o Título de la App */}
            <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
                <span className="icon">🧠</span> **English Game**
            </div>

            {/* Opciones de Navegación Centrales (Condicionales) */}
            <nav className="navbar-nav">
                
                {/* ------------------------------------------- */}
                {/* OPCIONES DE JUEGO Y TIENDA (Ocultas si isGameSession es TRUE) */}
                {/* ------------------------------------------- */}
                
                {/* 💡 LÓGICA CLAVE: Sólo mostramos si NO estamos en una sesión de juego */}
                {!isGameSession && (
                    <>
                        {/* Opción Tienda */}
                        <button className="nav-button" onClick={() => navigate('/shop')}>
                            <span className="icon">💰</span> Tienda
                        </button>

                        {/* Opción Jugar (Solo para usuarios normales) */}
                        {!isAdmin && (
                            <button className="nav-button" onClick={() => navigate('/game')}>
                                <span className="icon">🎮</span> Jugar
                            </button>
                        )}
                    </>
                )}


                {/* ------------------------------------------- */}
                {/* OPCIONES ESPECÍFICAS DE ADMINISTRADOR (Siempre visibles) */}
                {/* ------------------------------------------- */}
                {isAdmin && (
                    <>
                        <button className="nav-button admin-option" onClick={() => navigate('/admin/create-question')}>
                            <span className="icon">➕</span> Generar Pregunta
                        </button>
                        <button className="nav-button admin-option" onClick={() => navigate('/admin/users')}>
                            <span className="icon">👥</span> Ver Usuarios
                        </button>
                    </>
                )}
            </nav>

            {/* Opciones de Usuario y Cerrar Sesión (Siempre visibles) */}
            <div className="navbar-user-area">
                <details className="profile-details">
                    <summary className="user-summary">
                        <span className="icon">
                            {isAdmin ? '👑' : '👤'} 
                        </span> 
                        {usernameDisplay}
                    </summary>
                    <div className="profile-options">
                        <button 
                            className="sub-button view-profile"
                            onClick={() => navigate('/profile')} 
                        >
                            Ver Mi Perfil
                        </button>
                        <button 
                            className="sub-button logout"
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </details>
            </div>
        </header>
    );
};

export default Navbar;
