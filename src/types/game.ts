// 🚨 (ASUMIDO) Reemplaza o modifica la antigua definición de Question/Option

// 1. Tipo para las opciones que vienen del Backend (debe coincidir con ResponseOptionGameDTO)
export interface ResponseOptionGameDTO {
    id: number;          // 👈 ID real de la base de datos
    optionText: string;
}

// 2. Tipo para la pregunta completa
export interface Question { 
    id: number;
    questionText: string;
    difficultyLevel: string;
    pointsAwarded: number;
    category: string;
    // CRÍTICO: Ahora las opciones son objetos con ID
    options: ResponseOptionGameDTO[]; 
    correctAnswer: string; 
}

// 3. Respuesta de la sesión (solo si es necesario)
export interface GameSessionResponse {
    id: number;
}