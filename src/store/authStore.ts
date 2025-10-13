// src/store/authStore.ts

import { create } from 'zustand';
// CORRECCIÓN: Usar 'type' para importar solo la interfaz
import { type AuthResponse } from '../types/auth'; 
// !!! CORRECCIÓN: Eliminada la importación incorrecta de CSS.
// import  '../styles/auth.css'; // Esto no va en el store

// Define el estado de autenticación (el usuario sin el token)
interface AuthState {
  user: Omit<AuthResponse, 'token'> | null;
  token: string | null;
  isLoggedIn: boolean;
  
  // Acciones
  login: (authData: AuthResponse) => void;
  logout: () => void;
  // Agregamos una acción para cargar los datos de autenticación al inicio
  initializeAuth: () => void;
}

// Función auxiliar para inicializar el estado
const getInitialState = () => {
  const storedToken = localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('authUser');
  
  let initialUser: Omit<AuthResponse, 'token'> | null = null;
  
  if (storedUser) {
    try {
      initialUser = JSON.parse(storedUser);
    } catch (e) {
      console.error("Error al parsear usuario de localStorage:", e);
      localStorage.removeItem('authUser');
    }
  }

  return {
    user: initialUser,
    token: storedToken,
    isLoggedIn: !!storedToken && !!initialUser,
  }
}

// Inicializa el estado usando Zustand
const useAuthStore = create<AuthState>((set) => {
  
  return {
    ...getInitialState(), // Usamos la función auxiliar para el estado inicial

    login: (authData) => {
      // 1. Separar el token de los datos del usuario
      const { token, ...userData } = authData;

      // 2. Guardar en el almacenamiento local
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(userData));

      // 3. Actualizar el estado global
      set({
        user: userData,
        token: token,
        isLoggedIn: true,
      });
    },

    logout: () => {
      // 1. Limpiar el almacenamiento local
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      // 2. Limpiar el estado global
      set({
        user: null,
        token: null,
        isLoggedIn: false,
      });
    },

    // Función para reinicializar el estado si es necesario
    initializeAuth: () => {
        set(getInitialState());
    }
  };
});

export default useAuthStore;
