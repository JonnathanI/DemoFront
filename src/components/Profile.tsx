import React, { useState, useEffect } from 'react';

// 🛑 CORRECCIÓN 1: Usar 'type' para importar solo interfaces
import { getFullUserProfile, type UserProfileDTO, type UserGameStatDTO } from '../services/authService'; 

// 🛑 CORRECCIÓN 2: Usar el hook de Zustand (useAuthStore) en lugar del contexto
import useAuthStore from '../store/authStore'; 

// Se asume que la estructura de tu usuario en el store es:
interface AuthUser {
    id: number;
    username: string;
    role: string;
    // Agrega aquí otras propiedades que uses de 'user'
}


const Profile: React.FC = () => {
    // 🛑 CORRECCIÓN 3 & 4: Obtener user y token del store, y usar type assertion.
    // Asumimos que el store devuelve un objeto 'user' con 'id' y un 'token' string.
    const user = useAuthStore((state) => state.user) as AuthUser | null;
    const token = useAuthStore((state) => state.token) as string | null;
    
    const [profile, setProfile] = useState<UserProfileDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // La verificación de datos del usuario
        if (!user || !token || !user.id) { 
            setError("Usuario no autenticado o ID no disponible.");
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                // Usamos el ID y el Token del usuario autenticado
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
    }, [user?.id, token]); // user?.id como dependencia para evitar advertencias

    if (loading) return <div className="loading-message">Cargando perfil...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;
    if (!profile) return <div className="info-message">No se encontraron datos de perfil.</div>;

    return (
        <div className="profile-container">
            <h2>Perfil de Usuario: {profile.username}</h2>
            <div className="profile-stats">
                <p>Nombre Completo: <strong>{profile.fullName || 'N/A'}</strong></p>
                <p>Nivel Actual: <strong>{profile.currentLevel}</strong></p>
                <p>Puntos Totales: <strong>{profile.totalPoints}</strong></p>
                <p>Rol: <strong>{profile.role}</strong></p>
                <p>Aciertos: <strong>{profile.correctPercentage}%</strong> ({profile.correctAnswersCount}/{profile.totalQuestionsAnswered})</p>
            </div>

            <hr />

            <h3>Historial de Juego Reciente</h3>
            {profile.gameHistory.length === 0 ? (
                <p>Aún no hay historial de juego para mostrar.</p>
            ) : (
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Pregunta</th>
                            <th>Resultado</th>
                            <th>Puntos</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profile.gameHistory.map((session: UserGameStatDTO, index: number) => ( 
                            <tr key={index}>
                                {/* Mostrar solo los primeros 50 caracteres de la pregunta */}
                                <td>{session.questionText.substring(0, Math.min(session.questionText.length, 50))}...</td>
                                <td>
                                    {session.isCorrect ? (
                                        <span style={{ color: 'green' }}>✅ Correcta</span>
                                    ) : (
                                        <span style={{ color: 'red' }}>❌ Incorrecta</span>
                                    )}
                                </td>
                                <td>{session.pointsEarned}</td>
                                <td>{new Date(session.answeredAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Profile;