import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Login from './components/Login';
import Register from './components/Register';
import useAuthStore from './store/authStore';
import './App.css'; 
import MenuPrincipal from './components/MenuPrincipal'; 
import CreateQuestion from './pages/CreateQuestion';
// 1. IMPORTAR COMPONENTES DE JUEGO (StartGame es la pantalla de selección)
import StartGame from './components/StartGame';
import GameSession from './pages/GameSession';

// Componente Dashboard actúa como un contenedor para el MenuPrincipal
const Dashboard = () => {
    return <MenuPrincipal />;
};

/**
 * Componente de Ruta Protegida.
 * Redirige al usuario a la página de login si no está autenticado.
 */
const ProtectedRoute = ({ element }: { element: React.ReactElement }) => {
    // Usar el hook useAuthStore dentro del componente para reaccionar a los cambios de estado
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn); 
    return isLoggedIn ? element : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* --- RUTAS PROTEGIDAS --- */}
                
                {/* Dashboard (Menu Principal) */}
                <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
                
                {/* Generar Pregunta (Administrador) */}
                <Route path="/admin/create-question" element={<ProtectedRoute element={<CreateQuestion />} />} />
                
                {/* 1. RUTA DE SELECCIÓN DE DIFICULTAD */}
                {/* El usuario va aquí primero para elegir su nivel de juego */}
                <Route path="/game" element={<ProtectedRoute element={<StartGame />} />} />
                
                {/* 2. RUTA DE SESIÓN DE JUEGO */}
                {/* Aquí es donde se carga el GameSession con la dificultad elegida */}
                <Route path="/game/session" element={<ProtectedRoute element={<GameSession />} />} />

                {/* --- RUTA RAÍZ Y 404 --- */}

                {/* Ruta Raíz: Redirección dinámica basada en el estado de autenticación */}
                <Route 
                    path="/" 
                    element={<Navigate to={useAuthStore.getState().isLoggedIn ? "/dashboard" : "/login"} replace />} 
                />
                
                {/* Manejo de rutas no encontradas */}
                <Route path="*" element={<h1>404 | Página no encontrada</h1>} />
            </Routes>
        </Router>
    );
}

export default App;