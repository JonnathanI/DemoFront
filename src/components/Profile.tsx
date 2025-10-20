import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 🛑 Importar tipos y servicios
import { getFullUserProfile, type UserProfileDTO, type UserGameStatDTO } from '../services/authService'; 
import useAuthStore from '../store/authStore'; 

// Importar iconos para la gamificación y la galería de avatares
import { 
    FaUser, FaStar, FaLevelUpAlt, FaCheckCircle, FaTimesCircle, 
    FaChartBar, FaCalendarAlt, FaUserCircle, FaRobot, FaCat, 
    FaDog, FaDragon, FaCrown, FaGraduationCap, FaAppleAlt 
} from 'react-icons/fa'; 

import '../styles/Profile.css';

// Se asume que la estructura de tu usuario en el store es:
interface AuthUser {
    id: number;
    username: string;
    role: string;
}

// Mapeo de nombres de íconos a sus componentes reales
const avatarMap: { [key: string]: React.ComponentType<any> } = {
    FaUserCircle,
    FaRobot,
    FaCat,
    FaDog,
    FaDragon,
    FaCrown,
    FaGraduationCap,
    FaAppleAlt,
};

// Lista de avatares disponibles
const availableAvatars: string[] = Object.keys(avatarMap);

// Función auxiliar para obtener el componente de ícono
const getAvatarComponent = (name: string) => {
    return avatarMap[name] || FaUserCircle; // Default a FaUserCircle
};


const Profile: React.FC = () => {
    const user = useAuthStore((state) => state.user) as AuthUser | null;
    const token = useAuthStore((state) => state.token) as string | null;
    const location = useLocation();

    const [profile, setProfile] = useState<UserProfileDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ESTADOS para la selección de avatar
    const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);


    // FUNCIÓN: Enviar la selección del avatar al Backend
    const updateAvatar = async (iconName: string) => {
        if (!user || !token) return;

        setUploadMessage("Guardando avatar...");
        setUploadError(null);

        try {
            // Se asume que tu backend acepta PUT a /api/users/{userId} con el JSON
            const response = await fetch(`http://localhost:8081/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                // Envía solo el campo que necesitas actualizar. 
                // Asegúrate de que el backend en Kotlin maneje la recepción de este campo.
                body: JSON.stringify({ 
                    avatarIconName: iconName,
                    // Incluye otros campos necesarios si tu PUT requiere el objeto completo
                    // fullName: profile?.fullName, etc.
                }),
            });

            if (!response.ok) {
                throw new Error(`Error al actualizar el avatar: ${response.statusText}`);
            }

            // Actualizar localmente el estado del perfil con el nuevo ícono
            setProfile(prev => prev ? { ...prev, avatarIconName: iconName } : null);

            setUploadMessage("¡Avatar actualizado con éxito!");
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Fallo al actualizar el avatar.";
            setUploadError(errorMessage);
            setUploadMessage(null);
        }
    };
    
    // FUNCIÓN: Manejar la selección y disparar la actualización
    const handleAvatarSelect = (iconName: string) => {
        setIsSelectingAvatar(false);
        updateAvatar(iconName);
    };


    useEffect(() => {
        if (!user || !token || !user.id) { 
            setError("Usuario no autenticado o ID no disponible.");
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getFullUserProfile(user.id, token);
                setProfile(data);
            } catch (err) {
                console.error("Error al cargar el perfil:", err);
                setError("No se pudo cargar el perfil completo. Inténtalo de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        
    }, [user?.id, token, location.pathname]); 

    if (loading) return <div className="loading-message">Cargando perfil...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;
    if (!profile) return <div className="info-message">No se encontraron datos de perfil.</div>;

    const accuracy = profile.totalQuestionsAnswered > 0 ? profile.correctPercentage : 0;
    const accuracyDisplay = `${accuracy.toFixed(0)}%`; 

    // Obtener el componente de ícono a mostrar, usando el valor del perfil
    const CurrentAvatarComponent = getAvatarComponent(profile.avatarIconName || 'FaUserCircle');


    return (
        <div className="profile-container">
            {/* INICIO: SECCIÓN DE ENCABEZADO Y AVATAR */}
            <div className="profile-header"> 
                
                {/* 1. CONTENEDOR DEL AVATAR CON BOTÓN PARA SELECCIÓN */}
                <div className="avatar-container" onClick={() => setIsSelectingAvatar(true)}>
                    <CurrentAvatarComponent className="profile-avatar" />
                    <span className="avatar-edit-icon">Cambiar</span>
                </div>

                {uploadMessage && <p className="success-message">{uploadMessage}</p>}
                {uploadError && <p className="error-message-inline">{uploadError}</p>}


                {/* 2. MODAL DE SELECCIÓN DE AVATAR */}
                {isSelectingAvatar && (
                    <div className="avatar-modal-overlay">
                        <div className="avatar-modal">
                            <button className="close-button" onClick={() => setIsSelectingAvatar(false)}>&times;</button>
                            <h3>Selecciona tu Avatar</h3>
                            <div className="avatar-gallery">
                                {availableAvatars.map((iconName) => {
                                    const AvatarIcon = getAvatarComponent(iconName);
                                    return (
                                        <div 
                                            key={iconName} 
                                            className={`avatar-option ${profile.avatarIconName === iconName ? 'selected' : ''}`}
                                            onClick={() => handleAvatarSelect(iconName)}
                                        >
                                            <AvatarIcon />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}


                {/* 3. TÍTULO Y ROL */}
                <h1 className="profile-title">
                    ¡Hola, <strong>{profile.username}</strong>!
                </h1>
                <span className={`role-tag role-${profile.role.toLowerCase()}`}>{profile.role}</span>

            </div>
            {/* FIN: SECCIÓN DE ENCABEZADO Y AVATAR */}
            
            {/* SECCIÓN DE ESTADÍSTICAS EN GRID */}
            <div className="stats-grid">
                {/* 1. NOMBRE COMPLETO */}
                <div className="stat-box">
                    <p>Nombre Completo</p>
                    <strong className="stat-value" style={{fontSize: '1.5em'}}>{profile.fullName || 'N/A'}</strong>
                </div>

                {/* 2. NIVEL ACTUAL */}
                <div className="stat-box level">
                    <p><FaLevelUpAlt /> Nivel</p>
                    <strong className="stat-value">{profile.currentLevel}</strong>
                </div>

                {/* 3. PUNTOS TOTALES (MONEDA) */}
                <div className="stat-box points">
                    <p><FaStar /> Puntos</p>
                    <strong className="stat-value">{profile.totalPoints}</strong>
                </div>

                {/* 4. PRECISIÓN / ACIERTOS */}
                <div className="stat-box">
                    <p><FaChartBar /> Precisión</p>
                    <strong className="stat-value">{accuracyDisplay}</strong>
                    <small>({profile.correctAnswersCount}/{profile.totalQuestionsAnswered})</small>
                </div>
            </div>

            {/* HISTORIAL */}
            <div className="history-container">
                <h3>Historial de Juego Reciente</h3>
            {profile.gameHistory.length === 0 ? (
                <p>Aún no hay historial de juego para mostrar.</p>
            ) : (
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Pregunta</th>
                            <th>Resultado</th>
                            <th className="points-cell">Puntos</th>
                            <th><FaCalendarAlt /> Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profile.gameHistory.map((session: UserGameStatDTO, index: number) => ( 
                            <tr key={index}>
                                <td>{session.questionText.substring(0, Math.min(session.questionText.length, 50))}...</td>
                                <td className="result-cell">
                                    {session.isCorrect ? (
                                        <span className="result-correct"><FaCheckCircle /> Correcta</span>
                                    ) : (
                                        <span className="result-incorrect"><FaTimesCircle /> Incorrecta</span>
                                    )}
                                </td>
                                <td className="points-cell">{session.pointsEarned}</td>
                                <td>{new Date(session.answeredAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            </div>
        </div>
    );
};

export default Profile;