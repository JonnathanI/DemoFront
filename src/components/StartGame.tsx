import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StartGame.css'; // Crearemos este archivo CSS

const StartGame: React.FC = () => {
    const navigate = useNavigate();

    // Las dificultades deben coincidir con los valores en tu base de datos (Fácil, Básico, Difícil)
    const difficulties = ['Fácil', 'Básico', 'Difícil'];

    const handleStartGame = (difficulty: string) => {
        // Navega a la ruta de juego, pasando la dificultad como un parámetro de estado
        navigate('/game/session', { state: { difficulty } });
    };

    return (
        <div className="start-game-container">
            <h1 className="start-title">Selecciona el Nivel de Desafío</h1>
            <p className="start-subtitle">Elige el nivel de dificultad para empezar a responder preguntas.</p>
            
            <div className="difficulty-grid">
                {difficulties.map((difficulty, index) => (
                    <button
                        key={index}
                        className={`difficulty-button pop-on-hover ${difficulty.toLowerCase()}`}
                        onClick={() => handleStartGame(difficulty)}
                    >
                        <h2>{difficulty}</h2>
                        <p>{difficulty === 'Básico' ? 'Ideal para principiantes' : difficulty === 'Fácil' ? 'Un poco más de vocabulario' : 'Gramática y frases complejas'}</p>
                    </button>
                ))}
            </div>
            
            <button className="back-button" onClick={() => navigate('/dashboard')}>
                Volver al Dashboard
            </button>
        </div>
    );
};

export default StartGame;