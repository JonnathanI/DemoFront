// src/components/MenuPrincipal.tsx (Layout)

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Navbar from './Navbar'; // Importamos la nueva barra de navegación
import DashboardContent from './DashboardContent'; // Importamos el contenido central

const MenuPrincipal: React.FC = () => {
    const { isLoggedIn } = useAuthStore();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    return (
        // Contenedor principal de toda la aplicación una vez logeado
        <>
            <Navbar />
            <main className="main-content">
                {/* Muestra el contenido principal (Bienvenida) debajo de la barra fija */}
                <DashboardContent /> 
            </main>
        </>
    );
};

export default MenuPrincipal;