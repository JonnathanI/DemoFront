// Usada por questionService.ts y GameSession.tsx
export interface Question { 
    id: number;
    questionText: string;
    difficultyLevel: string; 
    category: string; 
    pointsAwarded: number; 
    options: string[]; // Arreglo de strings (textos de las opciones)
    correctAnswer: string; 
}

// Usada por gameService.ts (respuesta de startSession/finishSession)
export interface GameSessionResponse {
    id: number;
}