import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import useAuthStore from '../store/authStore';
import { getGameQuestions } from '../services/questionService'; 
import { submitAnswer, startSession, finishSession } from '../services/gameService'; 
import FinalScoreModal from '../components/FinalScoreModal'; 
// 💡 Importar el Navbar corregido
import Navbar from '../components/Navbar'; 
import { type Question, type ResponseOptionGameDTO } from '../types/game'; 
import '../styles/GameSession.css';

const GameSession: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const { token, isLoggedIn, user } = useAuthStore(); 
    
    const difficultyFromState = location.state?.difficulty as string;

    if (!difficultyFromState) {
        navigate('/game'); 
        return null; 
    }
    
    const difficulty = difficultyFromState;
    const count = 10; 

    // --- ESTADOS DEL JUEGO ---
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [selectedOptionText, setSelectedOptionText] = useState<string | null>(null);

    const [isAnswered, setIsAnswered] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    
    const [isFinished, setIsFinished] = useState(false);

    const totalQuestions = questions.length;

    // ----------------------------------------------------------------
    // --- LÓGICA DE INICIO Y CARGA ---
    // ----------------------------------------------------------------

    useEffect(() => {
        let isCancelled = false;
        
        const loadGame = async () => {
            if (!isLoggedIn || !token || !user?.id) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const sessionResponse = await startSession(user.id, difficulty, 'Prueba', token);
                if (isCancelled) return;
                setCurrentSessionId(sessionResponse.id);
                
                const data: Question[] = await getGameQuestions(difficulty, count, token);
                
                if (isCancelled) return;
                if (data.length === 0) {
                     setError(`No hay preguntas disponibles para la dificultad: ${difficulty}.`);
                }
                
                setQuestions(data);
                
            } catch (err: any) {
                if (isCancelled) return;
                console.error("Error al iniciar juego:", err);
                setError(`Error: ${err.message || 'Fallo al iniciar el juego.'}`);
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        loadGame();

        return () => { 
             isCancelled = true;
             if (currentSessionId && token && !isFinished) {
                 finishSession(currentSessionId, token).catch(console.error);
             }
        };
    }, [difficulty, count, token, isLoggedIn, user?.id, navigate, isFinished]); 


    // ----------------------------------------------------------------
    // --- LÓGICA DE ENVÍO DE RESPUESTA (ACTUALIZACIÓN DE SCORE) ---
    // ----------------------------------------------------------------

    const checkAndSubmitAnswer = async () => {
        if (selectedOptionId === null || !currentSessionId || !token) return; 

        setIsAnswered(true);

        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return; 

        try {
            const log = await submitAnswer(
                currentSessionId,
                currentQuestion.id,
                {
                    selectedOptionId: selectedOptionId, 
                    responseTimeMs: 500, 
                    advantageUsed: false
                },
                token
            );
            
            if (log.isCorrect) {
                setScore(prevScore => prevScore + log.pointsGained);
            }
            
            console.log(`Respuesta procesada. Puntos ganados: ${log.pointsGained}. ID de Opción Enviado (REAL): ${selectedOptionId}`);

        } catch (e: any) {
            console.error("Error al enviar la respuesta al Backend:", e.message);
        }
    };


    const handleNextQuestion = async () => {
        if (!isAnswered) return; 
        
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setSelectedOptionId(null); 
            setSelectedOptionText(null); 
            setIsAnswered(false);
        } else {
            try {
                if (currentSessionId && token) {
                    await finishSession(currentSessionId, token); 
                }
            } catch (e) {
                console.error("Error al finalizar la sesión en el servidor:", e);
            }
            
            setIsFinished(true); 
        }
    };
    
    const handleOptionSelect = (option: ResponseOptionGameDTO) => { 
        if (!isAnswered) {
            setSelectedOptionId(option.id);
            setSelectedOptionText(option.optionText);
        }
    };

    // --- RENDERIZADO CONDICIONAL ---

    if (isFinished) {
        return <FinalScoreModal finalScore={score} navigate={navigate} />;
    }

    if (loading || error || totalQuestions === 0) { 
        // Mostrar Navbar solo si el juego no ha terminado y no está cargando (opcional, puedes dejarlo siempre visible)
        return (
            <div className="game-wrapper">
                <Navbar isGameSession={true} /> {/* Ocultar navegación general incluso durante la carga */}
                <div className="loading-container p-6 text-center mt-20">
                    {loading ? `Cargando preguntas de nivel **${difficulty}**...` : error || "No hay preguntas para el juego."}
                </div>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];

    // --- RENDERIZADO PRINCIPAL ---

    return (
        <div className="game-wrapper">
            {/* 💡 AÑADIMOS EL NAVBAR AQUÍ y pasamos la prop */}
            <Navbar isGameSession={true} /> 

            <div className="game-container">
                <div className="game-header">
                    <span className="difficulty-label">Nivel: {difficulty}</span>
                    <span className="progress">Pregunta {currentQuestionIndex + 1} / {totalQuestions}</span>
                    <span className="score">Puntuación: {score}</span>
                </div>

                <div className="question-card">
                    <p className="question-text">{currentQuestion.questionText}</p> 
                </div>

                <div className="options-grid">
                    {currentQuestion.options.map((option: ResponseOptionGameDTO, index) => ( 
                        <button
                            key={option.id} 
                            onClick={() => handleOptionSelect(option)}
                            disabled={isAnswered}
                            className={`option-button ${selectedOptionId === option.id ? 'selected' : ''} ${
                                isAnswered 
                                    ? (option.optionText === currentQuestion.correctAnswer ? 'correct' : (selectedOptionId === option.id ? 'incorrect' : ''))
                                    : ''
                            }`}
                        >
                            {option.optionText} 
                        </button>
                    ))}
                </div>

                <div className="control-area">
                    {!isAnswered ? (
                        <button 
                            onClick={checkAndSubmitAnswer} 
                            disabled={selectedOptionId === null} 
                            className="check-button"
                        >
                            Verificar Respuesta
                        </button>
                    ) : (
                        <button 
                            onClick={handleNextQuestion} 
                            className="next-button"
                        >
                            {currentQuestionIndex < totalQuestions - 1 ? 'Siguiente Pregunta →' : 'Finalizar Juego'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameSession;
