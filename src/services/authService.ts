import axios from 'axios';
// CORRECCIÓN: Usar 'type' para importar solo interfaces
import { type LoginRequest, type RegisterRequest, type AuthResponse } from '../types/auth';

// Asegúrate de que la variable de entorno está definida
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/users`;

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
            throw new Error(error.response.data.message || "Error en el registro.");
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
            throw new Error(error.response.data.message || "Error al iniciar sesión.");
        }
        throw new Error("Ocurrió un error de red durante el login.");
    }
};

// ✅ NUEVA FUNCIÓN: Obtiene los puntos del usuario
export const getUserPoints = async (userId: number, token: string): Promise<number> => {
    try {
        const response = await axios.get<number>(`${API_URL}/${userId}/points`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        // El backend devuelve un entero (Int en Kotlin), que es 'number' en TypeScript
        return response.data; 
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(`Error ${error.response.status}: Fallo al obtener los puntos.`);
        }
        throw new Error("Ocurrió un error de red al consultar puntos.");
    }
};