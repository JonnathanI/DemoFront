import axios from 'axios';

// 💡 NOTA: Asegúrate que esta URL apunte al puerto 8081 de tu backend, 
// o usa la variable de entorno VITE_API_BASE_URL para que funcione correctamente.
// El endpoint de compra está en /api/users, no en /api/game.
const API_URL_GAME = `${import.meta.env.VITE_API_BASE_URL}/game`;
const API_URL_USERS = `${import.meta.env.VITE_API_BASE_URL}/users`; 

// ✅ Importar la interfaz de sesión desde types/game
import { type GameSessionResponse } from '../types/game'; 

// 💡 INTERFAZ NUEVA: Respuesta del backend tras comprar una pista
export interface HintResponseDTO {
    hintText: string;
    newPoints: number;
}

// Interfaces requeridas por GameSession.tsx
export interface AnswerSubmissionDTO {
    selectedOptionId: number;
    responseTimeMs: number;
    advantageUsed: boolean;
}

export interface ResponseLog {
    id: number;
    sessionId: number;
    questionId: number;
    selectedOptionId: number | null;
    isCorrect: boolean;
    pointsGained: number;
    responseTimeMs: number | null;
    advantageUsed: boolean;
}

// ==========================================================
// SERVICIOS DE SESIÓN Y RESPUESTA (SIN CAMBIOS)
// ==========================================================

/**
 * ✅ 1. Inicia una nueva sesión de juego y devuelve el ID.
 */
export const startSession = async (
    userId: number, 
    difficulty: string, 
    gameType: string, 
    token: string
): Promise<GameSessionResponse> => {
    try {
        const response = await axios.post<GameSessionResponse>(
            `${API_URL_GAME}/start?userId=${userId}&difficulty=${difficulty}&gameType=${gameType}`,
            null, 
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Error ${error.response.status}: Fallo al iniciar la sesión.`);
        }
        throw new Error("Fallo de red al iniciar la sesión.");
    }
};

/**
 * ✅ 2. Registra la respuesta del usuario y actualiza los puntos en el Backend.
 */
export const submitAnswer = async (
    sessionId: number,
    questionId: number,
    submission: AnswerSubmissionDTO,
    token: string
): Promise<ResponseLog> => {
    try {
        const response = await axios.post<ResponseLog>(
            `${API_URL_GAME}/${sessionId}/answer/${questionId}`,
            submission, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
             console.error("Detalle del Error al enviar respuesta:", error.response.data);
            throw new Error(`Error ${error.response.status}: Fallo al procesar la respuesta. (¿ID de opción inválido?)`);
        }
        throw new Error("Ocurrió un error de red al enviar la respuesta.");
    }
};

/**
 * ✅ 3. Finaliza la sesión de juego.
 */
export const finishSession = async (sessionId: number, token: string): Promise<GameSessionResponse> => {
    try {
        const response = await axios.post<GameSessionResponse>(
            `${API_URL_GAME}/${sessionId}/finish`,
            null,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Error ${error.response.status}: Fallo al finalizar la sesión.`);
        }
        throw new Error("Fallo de red al finalizar la sesión.");
    }
};

// ==========================================================
// 💡 SERVICIO NUEVO: COMPRA DE PISTA
// ==========================================================

/**
 * ✅ 4. Llama al backend para comprar una pista para una pregunta específica, 
 * descontando los puntos del usuario.
 */
export const buyHint = async (userId: number, questionId: number, token: string): Promise<HintResponseDTO> => {
    try {
        const response = await axios.post<HintResponseDTO>(
            // 💡 NOTA: El endpoint de compra está en la ruta de USERS, no en GAME
            `${API_URL_USERS}/${userId}/buy-hint`,
            { questionId: questionId },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // El backend de Kotlin ya devuelve el mensaje de error (ej: "Puntos insuficientes.")
            const errorMessage = error.response.data.error || `Error ${error.response.status}: Fallo al comprar pista.`;
            throw new Error(errorMessage);
        }
        throw new Error("Fallo de red al intentar comprar la pista.");
    }
};

// ==========================================================
// 💡 SERVICIO REQUERIDO: OBTENER PUNTOS DEL USUARIO
// ==========================================================

/**
 * ✅ 5. Obtiene el saldo de puntos actual del usuario (necesario para inicializar el estado).
 */
export const getInitialUserPoints = async (userId: number, token: string): Promise<number> => {
    try {
        const response = await axios.get<number>(
            `${API_URL_USERS}/${userId}/points`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error al obtener puntos:", error);
        return 0; // Devolver 0 o lanzar error si la app no puede funcionar sin el saldo
    }
};