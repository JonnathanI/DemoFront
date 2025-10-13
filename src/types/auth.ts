// src/types/auth.ts

/**
 * Interfaz para la solicitud de Login (LoginRequestDTO en el backend)
 */
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

/**
 * Interfaz para la solicitud de Registro (UserRegistrationDTO en el backend)
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  adminCode?: string; // Campo opcional para registro como ADMIN
}

/**
 * Interfaz para la respuesta exitosa del Login (UserLoginResponseDTO en el backend)
 */
export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  role: 'ADMIN' | 'USER';
  currentLevel: string;
  registrationDate: string;
  token: string; // El JWT Mock
}