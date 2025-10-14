import axios from 'axios';
// CORRECCIÓN: Usar 'type' para importar solo interfaces
import { type LoginRequest, type RegisterRequest, type AuthResponse } from '../types/auth';

// Asegúrate de que la variable de entorno está definida
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Obtener la base (ej: http://localhost:8081/api)
const API_URL = `${API_BASE_URL}/users`; // Ruta específica de usuarios (ej: http://localhost:8081/api/users)

// 💡 Interfaz para la solicitud de reseteo de contraseña
interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

/**
 * Llama al endpoint de Registro
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>(`${API_URL}/register`, userData);
        
        // NOTA: El backend devuelve la entidad User, no AuthResponse.
        // Esto es un ajuste temporal para que el frontend no falle.
        return response.data as unknown as AuthResponse; 
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error || "Error en el registro.");
        }
        throw new Error("Ocurrió un error de red durante el registro.");
    }
};

/**
 * Llama al endpoint de Login
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>(`${API_URL}/login`, credentials);
        return response.data; // Esto es el UserLoginResponseDTO
    } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
            throw new Error("Credenciales incorrectas. Intenta de nuevo.");
        }
        if (axios.isAxiosError(error) && error.response) {
            // El backend de Kotlin usa 'error' o 'message' en el cuerpo
            const errorMessage = error.response.data.error || error.response.data.message || "Error al iniciar sesión.";
            throw new Error(errorMessage);
        }
        throw new Error("Ocurrió un error de red durante el login.");
    }
};

// ==========================================================
// 🔑 FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA (AÑADIDAS)
// ==========================================================

/**
 * 1. Llama al endpoint /forgot-password para solicitar el envío del correo de recuperación.
 * @param email El correo electrónico del usuario.
 */
export const forgotPassword = async (email: string): Promise<string> => {
    try {
        // Llama a POST /api/users/forgot-password
        const response = await axios.post<{ message: string }>(
            `${API_URL}/forgot-password`,
            { email: email }
        );
        // Retorna el mensaje de éxito genérico del backend
        return response.data.message;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Se debe manejar el error 500/400 o extraer el error del cuerpo si existe
            const errorMessage = error.response.data.error || 'Ocurrió un error al intentar enviar el correo.';
            throw new Error(errorMessage);
        }
        throw new Error("Fallo de red al solicitar el cambio de contraseña.");
    }
};

/**
 * 2. Llama al endpoint /reset-password para restablecer la contraseña usando el token.
 * @param data Objeto con el token y la nueva contraseña.
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<string> => {
    try {
        // Llama a POST /api/users/reset-password
        const response = await axios.post<{ message: string }>(
            `${API_URL}/reset-password`,
            data
        );
        return response.data.message; // "Contraseña restablecida exitosamente."
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Captura errores del backend (ej: "Token inválido o expirado")
            const errorMessage = error.response.data.error || 'El token es inválido o el enlace ha expirado.';
            throw new Error(errorMessage);
        }
        throw new Error("Fallo de red al restablecer la contraseña.");
    }
};


// ✅ FUNCIÓN EXISTENTE: Obtiene los puntos del usuario
export const getUserPoints = async (userId: number, token: string): Promise<number> => {
    try {
        const response = await axios.get<number>(`${API_URL}/${userId}/points`, {
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