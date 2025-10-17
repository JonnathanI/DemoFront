import axios from 'axios';
// Asegúrate de que tienes una interfaz para el objeto User (como lo devuelve el backend)
import type { User, UserRegistrationDTO } from '../types/user'; 

// Asume que la URL base de usuarios es la que ya tienes
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
const API_URL_USERS = `${API_BASE_URL}/users`; 

// ==========================================================
// 🔑 FUNCIONES DE ADMINISTRACIÓN DE USUARIOS
// ==========================================================

// Interfaz para la actualización parcial
interface UserUpdateData {
    fullName?: string;
    email?: string;
    role?: string;
    currentLevel?: string;
}

/**
 * [R - Read] Obtiene la lista completa de usuarios.
 */
export const fetchAllUsers = async (token: string): Promise<User[]> => {
    try {
        const response = await axios.get<User[]>(`${API_URL_USERS}/all`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error("Fallo al obtener la lista de usuarios.");
    }
};

/**
 * [C - Create] Crea un nuevo usuario (reutiliza la lógica de registro).
 */
export const createNewUser = async (userData: UserRegistrationDTO, token: string): Promise<User> => {
     try {
        // Asumiendo que el endpoint /register maneja el rol si se envía adminCode.
        const response = await axios.post<User>(`${API_URL_USERS}/register`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error("Fallo al crear el nuevo usuario.");
    }
}

/**
 * [U - Update] Actualiza el perfil o los roles/niveles de un usuario.
 */
export const updateAdminUser = async (userId: number, data: UserUpdateData, token: string): Promise<User> => {
    try {
        // Usamos el endpoint que permite al admin modificar rol/nivel
        const response = await axios.put<User>(`${API_URL_USERS}/${userId}/admin-update`, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(`Fallo al actualizar el usuario ${userId}.`);
    }
};

/**
 * [D - Delete] Elimina un usuario por ID.
 */
export const deleteUser = async (userId: number, token: string): Promise<void> => {
    try {
        await axios.delete(`${API_URL_USERS}/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    } catch (error) {
        throw new Error(`Fallo al eliminar el usuario ${userId}.`);
    }
};