// ----------------------------------------------------------
// 1. Interfaz del objeto de Usuario (tal como lo devuelve el backend)
// ----------------------------------------------------------
export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string | null; // Asumiendo que es opcional o puede ser nulo
    passwordHash: string; // Puede que no se use en el frontend, pero es parte del modelo
    registrationDate: string; // Usualmente un string de fecha/hora ISO 8601
    currentLevel: string;
    role: 'USER' | 'ADMIN';
    // Nota: El backend de Kotlin devuelve esto en el registro/actualización.
}


// ----------------------------------------------------------
// 2. Interfaz para el REGISTRO (o CREACIÓN de nuevo usuario por el Admin)
// ----------------------------------------------------------
// Coincide con tu DTO de registro en Kotlin (UserRegistrationDTO)
export interface UserRegistrationDTO {
    username: string;
    email: string;
    password: string;
    fullName?: string; // Opcional
    adminCode?: string; // Opcional (usado para auto-asignar rol ADMIN)
}


// ----------------------------------------------------------
// 3. Interfaz para el LOGIN (Respuesta del backend)
// ----------------------------------------------------------
// Coincide con tu DTO de respuesta de login en Kotlin (UserLoginResponseDTO)
export interface AuthResponse {
    id: number;
    username: string;
    email: string;
    fullName: string | null;
    role: 'USER' | 'ADMIN';
    currentLevel: string;
    registrationDate: string;
    token: string; // El JWT o token mock
    // Nota: Esta es la que usas en authStore y authService.
}


// ----------------------------------------------------------
// 4. Interfaz de Datos de Actualización (Lo que el frontend envía al PUT/admin-update)
// ----------------------------------------------------------
export interface UserUpdateData {
    fullName?: string;
    email?: string;
    role?: 'USER' | 'ADMIN';
    currentLevel?: string;
}