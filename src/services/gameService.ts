import axios from 'axios';
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/game`;
// ✅ Importar la interfaz de sesión desde types/game
import { type GameSessionResponse } from '../types/game'; 

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
            `${API_URL}/start?userId=${userId}&difficulty=${difficulty}&gameType=${gameType}`,
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
            `${API_URL}/${sessionId}/answer/${questionId}`,
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
            `${API_URL}/${sessionId}/finish`,
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