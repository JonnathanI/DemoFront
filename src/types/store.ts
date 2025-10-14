// Basado en CosmeticDTO y ProfileCosmetic
export interface Cosmetic {
    id: number; // Necesario para la compra
    name: string;
    type: 'Avatar' | 'Fondo' | 'Marco';
    pointCost: number;
    resourceUrl: string;
}

// Basado en AdvantageDTO y Advantage
export interface Advantage {
    id: number; // Necesario para la compra
    name: string;
    description: string;
    pointCost: number;
    effect: string; // 'Extra_Time_10s', 'Hint_Remove_Option', etc.
}

// Interfaz para el objeto de respuesta de puntos, aunque el backend devuelva solo el número
export interface UserPointsResponse {
    totalPoints: number;
}