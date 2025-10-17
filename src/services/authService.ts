import axios from 'axios';
// Importaciones de tipos necesarias
import { type LoginRequest, type RegisterRequest, type AuthResponse } from '../types/auth'; 
import { type CredentialResponse } from '@react-oauth/google';
import type { User, UserRegistrationDTO } from '../types/user'; // Asumo que AuthResponse usa tipos de User

// Asegúrate de que la variable de entorno está definida
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
const API_URL_USERS = `${API_BASE_URL}/users`; // Ruta específica de usuarios

// ==========================================================
// 💡 INTERFACES DE PERFIL Y CONTRASEÑA
// ==========================================================

// Interfaz para la solicitud de reseteo de contraseña
interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

// Interfaz para una entrada en el historial de juego
export interface UserGameStatDTO {
    questionText: string;
    isCorrect: boolean;
    pointsEarned: number;
    answeredAt: string;
}

// Interfaz que coincide con el UserProfileDTO del backend (PERFIL COMPLETO)
export interface UserProfileDTO {
    userId: number;
    username: string;
    email: string;
    fullName: string | null;
    currentLevel: string;
    totalPoints: number;
    role: string;
    totalQuestionsAnswered: number;
    correctAnswersCount: number;
    correctPercentage: number; 
    gameHistory: UserGameStatDTO[];
}


// ==========================================================
// 🔑 FUNCIONES DE AUTENTICACIÓN
// ==========================================================

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    // ... (lógica de registro) ...
    try {
        const response = await axios.post<AuthResponse>(`${API_URL_USERS}/register`, userData);
        return response.data as unknown as AuthResponse; 
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error || "Error en el registro.");
        }
        throw new Error("Ocurrió un error de red durante el registro.");
    }
};

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    // ... (lógica de login) ...
    try {
        const response = await axios.post<AuthResponse>(`${API_URL_USERS}/login`, credentials);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data.error || error.response.data.message || "Error al iniciar sesión.";
            throw new Error(errorMessage);
        }
        throw new Error("Ocurrió un error de red durante el login.");
    }
};

export const loginWithGoogle = async (googleCredential: string): Promise<AuthResponse> => {
    // ... (lógica de login con Google) ...
    try {
        const response = await axios.post<AuthResponse>(`${API_URL_USERS}/login/google`, {
            token: googleCredential, 
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const message = error.response.data.error || 'Fallo la autenticación con Google. Token inválido.';
            throw new Error(message);
        }
        throw new Error('Error de red o conexión al intentar login con Google.');
    }
};


// ==========================================================
// 🔑 FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA
// ==========================================================

export const forgotPassword = async (email: string): Promise<string> => {
    // ... (lógica de forgotPassword) ...
    try {
        const response = await axios.post<{ message: string }>(
            `${API_URL_USERS}/forgot-password`,
            { email: email }
        );
        return response.data.message;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data.error || 'Ocurrió un error al intentar enviar el correo.';
            throw new Error(errorMessage);
        }
        throw new Error("Fallo de red al solicitar el cambio de contraseña.");
    }
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<string> => {
    // ... (lógica de resetPassword) ...
    try {
        const response = await axios.post<{ message: string }>(
            `${API_URL_USERS}/reset-password`,
            data
        );
        return response.data.message;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const errorMessage = error.response.data.error || 'El token es inválido o el enlace ha expirado.';
            throw new Error(errorMessage);
        }
        throw new Error("Fallo de red al restablecer la contraseña.");
    }
};


// ==========================================================
// 👤 FUNCIONES DE PERFIL Y PUNTOS (para el usuario logueado)
// ==========================================================

/**
 * Obtiene el perfil completo del usuario, estadísticas de juego e historial.
 * (Función necesaria para el componente Profile.tsx)
 */
export const getFullUserProfile = async (userId: number, token: string): Promise<UserProfileDTO> => {
    try {
        const response = await axios.get<UserProfileDTO>(`${API_URL_USERS}/${userId}/profile/full`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const message = error.response.data.error || 'Fallo al cargar el perfil de usuario.';
            throw new Error(message);
        }
        throw new Error('Error de red al intentar obtener el perfil completo.');
    }
};


/**
 * Obtiene solo los puntos del usuario.
 * 🛑 CORRECCIÓN APLICADA: La ruta ya no incluye el userId.
 */
export const getUserPoints = async (userId: number, token: string): Promise<number> => {
    try {
        // 🛑 CORRECCIÓN: Se cambia la URL de `${API_URL_USERS}/${userId}/points` a solo `${API_URL_USERS}/points`
        const response = await axios.get<number>(`${API_URL_USERS}/points`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data; 
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Error ${error.response.status}: Fallo al obtener los puntos.`);
        }
        throw new Error("Ocurrió un error de red al consultar puntos.");
    }
};