import axios from 'axios';
import { type Advantage, type Cosmetic } from '../types/store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STORE_API_URL = `${API_BASE_URL}/store`;
const ADMIN_API_URL = `${API_BASE_URL}/admin`; // Usamos esta para listar, ya que el backend lo necesita


// ==========================================================
// --- Obtener Listas de Ítems (Usando las URLs de la Lógica de Administrador) ---
// ==========================================================

/**
 * Obtiene todos los cosméticos disponibles (asume un endpoint GET de lista).
 * NOTA: Tu StoreController no tiene un GET. Asumo que está en un controlador de Admin o que debes crearlo.
 */
export const fetchAllCosmetics = async (token: string): Promise<Cosmetic[]> => {
    try {
        // Asumo que el endpoint para listar es /api/admin/cosmetics
        const response = await axios.get<Cosmetic[]>(`${ADMIN_API_URL}/cosmetics`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        return response.data;
    } catch (error) {
        console.error("Fallo al obtener cosméticos (Revise el endpoint /admin/cosmetics):", error);
        // Retornamos un mock si hay error de permisos para no bloquear la UI
        return []; 
    }
};

/**
 * Obtiene todas las ventajas disponibles (asume un endpoint GET de lista).
 */
export const fetchAllAdvantages = async (token: string): Promise<Advantage[]> => {
    try {
        // Asumo que el endpoint para listar es /api/admin/advantages
        const response = await axios.get<Advantage[]>(`${ADMIN_API_URL}/advantages`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        return response.data;
    } catch (error) {
        console.error("Fallo al obtener ventajas (Revise el endpoint /admin/advantages):", error);
        // Retornamos un mock si hay error de permisos para no bloquear la UI
        return []; 
    }
};

// ==========================================================
// --- Lógica de Compra (Consumiendo StoreController) ---
// ==========================================================

/**
 * Compra un cosmético con puntos. Consumo: POST /api/store/buy/cosmetic?userId=...&cosmeticId=...
 */
export const buyCosmetic = async (userId: number, cosmeticId: number, token: string): Promise<any> => {
    try {
        const response = await axios.post(
            `${STORE_API_URL}/buy/cosmetic?userId=${userId}&cosmeticId=${cosmeticId}`, 
            null,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Error ${error.response.status}: Fallo en la compra.`);
        }
        throw new Error("Fallo de red al comprar cosmético.");
    }
};

/**
 * Compra una ventaja con puntos. Consumo: POST /api/store/buy/advantage?userId=...&advantageId=...
 */
export const buyAdvantage = async (userId: number, advantageId: number, token: string): Promise<any> => {
    try {
        const response = await axios.post(
            `${STORE_API_URL}/buy/advantage?userId=${userId}&advantageId=${advantageId}`, 
            null,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `Error ${error.response.status}: Fallo en la compra.`);
        }
        throw new Error("Fallo de red al comprar ventaja.");
    }
};