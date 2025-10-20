// DTO para crear o editar un estilo (Admin usa este)
export interface AvatarStyleRequestDTO {
    iconName: string;
    price: number;
    isPurchasable: boolean;
}

// Estructura de la respuesta GET de /api/admin/avatars
export interface AvatarStyle {
    id: number;
    iconName: string;
    price: number;
    isPurchasable: boolean;
}