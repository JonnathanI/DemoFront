import axios from 'axios';
// ✅ CORRECCIÓN: Importar Question desde la carpeta types/
import { type Question } from '../types/game'; 

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/questions`;

/**
 * Obtiene el set de preguntas para el juego desde el backend.
 * @param difficulty - Dificultad (e.g., 'Normal').
 * @param count - Número de preguntas a obtener (e.g., 10).
 * @param token - Token JWT para la autenticación.
 */
export const getGameQuestions = async (
    difficulty: string, 
    count: number, 
    token: string
): Promise<Question[]> => {
    try {
        const response = await axios.get<Question[]>(
            // NOTA: Si el endpoint de preguntas está en /api/game/questions, el API_URL debe ser /api/game.
            // Asumiendo que el endpoint es: /api/questions/game
            `${API_URL}/game?difficulty=${difficulty}&count=${count}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Error: ${error.response.status}. ${error.response.data.message || 'Fallo al obtener preguntas.'}`);
        }
        throw new Error("Ocurrió un error de red o conexión.");
    }
};
