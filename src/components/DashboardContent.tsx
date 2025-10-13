import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { Navigate, useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard'; 
import '../styles/Dashboard.css'; 

// ✅ Importamos la nueva función del servicio de autenticación
import { getUserPoints } from '../services/authService'; 
import { type AuthResponse } from '../types/auth';

// Definimos la interfaz para la prop 'user' que espera este componente
interface UserWelcomeContentProps {
    user: Omit<AuthResponse, 'token'>; 
    // Prop dinámica para pasar los puntos
    totalPoints: number | 'Cargando...';
}

// Pasamos 'user' y 'totalPoints' como props a UserWelcomeContent
const UserWelcomeContent: React.FC<UserWelcomeContentProps> = ({ user, totalPoints }) => {
    const navigate = useNavigate();
    
    // Este es el contenido que ve un usuario normal (USER)
    return (
        <div className="welcome-card user-card">
            <h1 className="welcome-title">¡Hola, {user.username}!</h1>
            <p className="level-info">Estás listo para aprender inglés y ganar puntos.</p>
            <div className="stat-box">
                <span>Nivel Actual: **{user.currentLevel}**</span>
                {/* ✅ VALOR DINÁMICO: Muestra los puntos cargados */}
                <span>Puntos: **{totalPoints}**</span> 
            </div>
            <button 
                className="start-button"
                onClick={() => navigate('/game')}
            >
                ¡Comenzar Reto de Juego!
            </button>
        </div>
    );
};


const DashboardContent: React.FC = () => {
    const { user, token } = useAuthStore();
    // ✅ NUEVO ESTADO: Para almacenar los puntos dinámicamente
    const [totalPoints, setTotalPoints] = useState<number | 'Cargando...'>('Cargando...');

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }
    
    const isAdmin = user.role === 'ADMIN';

    // ✅ NUEVO useEffect: Consulta los puntos al cargar el componente
    useEffect(() => {
        const fetchPoints = async () => {
            if (user && token) {
                try {
                    // Llama al nuevo método del servicio para obtener los puntos
                    const points = await getUserPoints(user.id, token); 
                    setTotalPoints(points);
                } catch (e) {
                    console.error("Error al obtener puntos:", e);
                    setTotalPoints(0); // Muestra 0 en caso de error
                }
            }
        };

        // Solo carga puntos si no es un administrador
        if (!isAdmin) {
             fetchPoints();
        }
    }, [user, token, isAdmin]); // Dependencias: se ejecuta cuando cambia el usuario o el token

    return (
        <div className="content-container">
            {/* Renderizado condicional según el rol */}
            {isAdmin 
                ? <AdminDashboard /> 
                /* ✅ Pasamos el estado de puntos al componente hijo */
                : <UserWelcomeContent user={user} totalPoints={totalPoints} />
            }
        </div>
    );
};

export default DashboardContent;