import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Login from './components/Login';
import Register from './components/Register';
import useAuthStore from './store/authStore';
import './App.css'; 
import MenuPrincipal from './components/MenuPrincipal'; 
import CreateQuestion from './pages/CreateQuestion';
import StartGame from './components/StartGame';
import GameSession from './pages/GameSession';

// 💡 IMPORTAR LOS NUEVOS COMPONENTES
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';


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

// Componente: Redirección de la Ruta Raíz
const RootRedirect: React.FC = () => {
    // Usar el hook useAuthStore para obtener el estado actual
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    // Redirige en base al estado reactivo
    if (isLoggedIn) {
        return <Navigate to="/dashboard" replace />;
    } else {
        return <Navigate to="/login" replace />;
    }
}

function App() {
    return (
        <Router>
            <Routes>
                {/* --- RUTAS DE AUTENTICACIÓN (PÚBLICAS) --- */}
                
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* 🔑 NUEVAS RUTAS PARA RECUPERACIÓN DE CONTRASEÑA */}
                <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
                <Route path="/reset-password" element={<ResetPasswordScreen />} />

                {/* --- RUTAS PROTEGIDAS --- */}
                
                {/* Dashboard (Menu Principal) */}
                <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
                
                {/* Generar Pregunta (Administrador) */}
                <Route path="/admin/create-question" element={<ProtectedRoute element={<CreateQuestion />} />} />
                
                {/* 1. RUTA DE SELECCIÓN DE DIFICULTAD */}
                <Route path="/game" element={<ProtectedRoute element={<StartGame />} />} />
                
                {/* 2. RUTA DE SESIÓN DE JUEGO */}
                <Route path="/game/session" element={<ProtectedRoute element={<GameSession />} />} />

                {/* --- RUTA RAÍZ Y 404 --- */}

                {/* 💡 Usa el componente RootRedirect */}
                <Route path="/" element={<RootRedirect />} />
                
                {/* Manejo de rutas no encontradas */}
                <Route path="*" element={<h1>404 | Página no encontrada</h1>} />
            </Routes>
        </Router>
    );
}

export default App;
