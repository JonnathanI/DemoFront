import React, { useEffect, useState } from 'react';
// 🐛 CORRECCIÓN TS1484: Usar 'import type' para importar exclusivamente tipos
import type { NavigateFunction } from 'react-router-dom'; 
import '../styles/FinalScoreModal.css';

interface FinalScoreModalProps {
    finalScore: number;
    navigate: NavigateFunction; // La función de navegación de React Router
}

const FinalScoreModal: React.FC<FinalScoreModalProps> = ({ finalScore, navigate }) => {
    // Estado para la animación del contador
    const [displayScore, setDisplayScore] = useState(0);

    // Animación de puntuación (contar de 0 a la puntuación final)
    useEffect(() => {
        // 🚀 LÓGICA CORREGIDA: Siempre intentamos la animación, incluso si finalScore es 0.
        const duration = 1500; // 1.5 segundos
        const intervalTime = 10;
        const steps = duration / intervalTime;
        
        // Si finalScore es 0, stepValue será 0, y el contador se detendrá inmediatamente en 0.
        // Si es > 0, hará la animación.
        const stepValue = finalScore / steps; 

        let current = 0;
        const timer = setInterval(() => {
            current += stepValue;
            if (current >= finalScore) {
                setDisplayScore(finalScore);
                clearInterval(timer);
            } else {
                // Usar Math.floor para mostrar números enteros
                setDisplayScore(Math.floor(current)); 
            }
        }, intervalTime);

        return () => clearInterval(timer);
    }, [finalScore]); // Dependencia del score final

    const handleAceptar = () => {
        navigate('/dashboard');
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2 className="modal-title">¡Juego Terminado!</h2>
                
                <div className="score-animation-area">
                    <span className="trophy-icon">🏆</span> 
                    
                    <p className="final-score-text">
                        Puntuación Final: <span className="score-number">{displayScore}</span>
                    </p>
                    
                    {/* Muestra mensajes según la puntuación */}
                    {finalScore > 500 && <p className="encouragement">¡Excelente trabajo!</p>}
                    {finalScore <= 500 && finalScore > 0 && <p className="encouragement">¡Buen esfuerzo!</p>}
                    {finalScore === 0 && <p className="encouragement">¡Sigue practicando para ganar puntos!</p>}
                </div>

                <button 
                    onClick={handleAceptar} 
                    className="modal-button"
                >
                    Aceptar y Volver al Dashboard
                </button>
            </div>
        </div>
    );
};

export default FinalScoreModal;