import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import '../styles/Dashboard.css'; // Reutilizamos los estilos base del Dashboard

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    return (
        <div className="admin-dashboard-panel">
            <h1 className="admin-welcome-title">Panel de Administración</h1>
            <p className="admin-subtitle">Bienvenido, {user?.username}. Selecciona una tarea:</p>

            <div className="admin-actions-grid">
                
                {/* Acción 1: Generar Pregunta */}
                <button 
                    className="admin-action-button create-q"
                    onClick={() => navigate('/admin/create-question')}
                >
                    <span className="icon">📝</span>
                    <h2>Generar Pregunta</h2>
                    <p>Añade nuevos desafíos y contenido al juego.</p>
                </button>
                
                {/* Acción 2: Ver Usuarios */}
                <button 
                    className="admin-action-button view-users"
                    onClick={() => navigate('/admin/users')}
                >
                    <span className="icon">🧑‍💻</span>
                    <h2>Gestión de Usuarios</h2> {/* Título actualizado para claridad */}
                    <p>Crea, edita o elimina cuentas de usuario.</p>
                </button>

                {/* Acción 3: Gestión de Tienda */}
                <button 
                    className="admin-action-button shop-access"
                    onClick={() => navigate('/shop')}
                >
                    <span className="icon">🛍️</span>
                    <h2>Gestión de Tienda</h2>
                    <p>Configura ítems y precios del juego.</p>
                </button>
                
            </div>
        </div>
    );
};

export default AdminDashboard;
