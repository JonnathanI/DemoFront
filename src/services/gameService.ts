import axios from 'axios';

// Asegúrate de que la variable de entorno está definida
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
const API_URL_GAME = `${API_BASE_URL}/game`; // Ruta para la mayoría de las operaciones de juego
const API_URL_USERS = `${API_BASE_URL}/users`; // Necesaria para getInitialUserPoints

// ==========================================================
// 💡 INTERFACES REQUERIDAS POR EL COMPONENTE
// ==========================================================

// Interfaz para la respuesta de inicio de sesión
interface SessionResponse {
    id: number;
    // Otros campos que devuelva el backend
}

// Interfaz para el objeto de respuesta enviado al backend
interface AnswerSubmissionDTO {
    selectedOptionId: number; 
    responseTimeMs: number;
    advantageUsed: boolean;
}

// Interfaz para la respuesta de registro de respuesta
interface AnswerLogResponse {
    isCorrect: boolean;
    pointsGained: number;
    // Otros campos que devuelva el backend
}

// Interfaz para la respuesta de la pista
export interface HintResponse {
    hint: string;
    newPoints: number;
}

// ==========================================================
// 🕹️ FUNCIONES DE JUEGO
// ==========================================================

/**
 * [Función Faltante 1/5]
 * Inicia una sesión de juego en el backend.
 * 🛑 CORRECCIÓN CLAVE: Los parámetros se envían como Query Params
 */
export const startSession = async (userId: number, difficulty: string, gameType: string, token: string): Promise<SessionResponse> => {
    try {
        // Construye la URL con Query Parameters según espera GameController.kt
        const url = `${API_URL_GAME}/start?userId=${userId}&difficulty=${difficulty}&gameType=${gameType}`;

        // El cuerpo del POST debe ser `null` o un objeto vacío si no hay datos de cuerpo, 
        // ya que los datos están en la URL. Usamos `null` por convención para POST sin cuerpo.
        const response = await axios.post<SessionResponse>(
            url, 
            null, // Cuerpo de la solicitud
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        throw new Error("Fallo al iniciar la sesión de juego.");
    }
};

/**
* [Función Faltante 2/5]
 * Envía la respuesta del usuario al backend.
 * 🛑 CORRECCIÓN CLAVE: Mover sessionId y questionId de body a URL (Path Variables).
 */
export const submitAnswer = async (sessionId: number, questionId: number, submission: AnswerSubmissionDTO, token: string): Promise<AnswerLogResponse> => {
    try {
        // ✅ CORRECCIÓN: Construir la URL usando Path Variables
        const url = `${API_URL_GAME}/${sessionId}/answer/${questionId}`;

        const response = await axios.post<AnswerLogResponse>(
            url, 
            // ✅ CORRECCIÓN: Ahora solo se envía el objeto submission en el cuerpo.
            submission, 
            { 
                headers: { 'Authorization': `Bearer ${token}` } 
            }
        );
        return response.data;
    } catch (error) {
        throw new Error("Fallo al enviar la respuesta.");
    }
};

/**
 * [Función Faltante 3/5]
 * Finaliza la sesión de juego en el backend.
 */
export const finishSession = async (sessionId: number, token: string): Promise<void> => {
    try {
        await axios.post(`${API_URL_GAME}/${sessionId}/finish`, null, 
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
    } catch (error) {
        throw new Error("Fallo al finalizar la sesión de juego.");
    }
};

/**
 * [Función Faltante 4/5]
 * Compra una pista para la pregunta actual.
 * (La función previamente discutida)
 */
export const buyHint = async (userId: number, questionId: number, token: string): Promise<HintResponse> => {
    try {
        const response = await axios.post<HintResponse>(
            `${API_URL_GAME}/buy-hint`, 
            { userId, questionId }, 
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data.error || 'Fallo al comprar la pista. Puntos insuficientes.';
            throw new Error(errorMessage);
        }
        throw new Error('Error de red al intentar comprar la pista.');
    }
};

/**
 * [Función Faltante 5/5]
 * Obtiene el saldo actual de puntos del usuario.
 * (Esta función ya existía en tu código anterior como getUserPoints, la renombramos aquí para GameSession).
 * 🛑 NOTA: Asumo que esta función ya fue corregida para no usar userId en la URL
 */
export const getInitialUserPoints = async (userId: number, token: string): Promise<number> => {
    try {
        const response = await axios.get<number>(`${API_URL_USERS}/points`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return response.data; 
    } catch (error) {
        throw new Error("Ocurrió un error de red al consultar puntos.");
    }
};