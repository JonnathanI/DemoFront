import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import useAuthStore from '../store/authStore';
import { getGameQuestions } from '../services/questionService'; 
import { 
    submitAnswer, 
    startSession, 
    finishSession, 
    buyHint, 
    getInitialUserPoints // Función para obtener el saldo actual
} from '../services/gameService'; 
import FinalScoreModal from '../components/FinalScoreModal'; 
import Navbar from '../components/Navbar'; 
import { type Question, type ResponseOptionGameDTO } from '../types/game'; 
import '../styles/GameSession.css';

const HINT_COST = 50; 

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
    const userId = user?.id;

    // --- ESTADOS ---
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0); // Puntos GANADOS en esta sesión
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [selectedOptionText, setSelectedOptionText] = useState<string | null>(null);

    const [isAnswered, setIsAnswered] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    // ESTADOS PARA PISTAS Y PUNTOS DE SALDO
    const [userPoints, setUserPoints] = useState(0); // Puntos de SALDO (para compra/venta)
    const [currentHint, setCurrentHint] = useState<string | null>(null);
    const [hintError, setHintError] = useState<string | null>(null);

    const totalQuestions = questions.length;

    // ----------------------------------------------------------------
    // --- LÓGICA DE INICIO Y CARGA ---
    // ----------------------------------------------------------------

    useEffect(() => {
        let isCancelled = false;
        
        const loadGame = async () => {
            if (!isLoggedIn || !token || !userId) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // 1. OBTENER PUNTOS INICIALES (SALDO)
                const initialPoints = await getInitialUserPoints(userId, token);
                if (isCancelled) return;
                setUserPoints(initialPoints);

                // 2. INICIAR SESIÓN SOLO SI ES LA PRIMERA VEZ
                if (currentSessionId === null) {
                    const sessionResponse = await startSession(userId, difficulty, 'Prueba', token);
                    if (isCancelled) return;
                    setCurrentSessionId(sessionResponse.id);
                }
                
                // 3. OBTENER PREGUNTAS
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
    }, [difficulty, count, token, isLoggedIn, userId, navigate, isFinished]); 

    // Reiniciar la pista al cambiar de pregunta
    useEffect(() => {
        setCurrentHint(null);
        setHintError(null);
    }, [currentQuestionIndex]);


    const currentQuestion = questions[currentQuestionIndex];
    
    // ----------------------------------------------------------------
    // --- LÓGICA DE COMPRA DE PISTA (Actualiza el saldo localmente) ---
    // ----------------------------------------------------------------
    const handleBuyHint = async () => {
        if (!userId || !token || !currentQuestion?.id || currentHint) return;
        setHintError(null);

        if (userPoints < HINT_COST) {
            setHintError(`Puntos insuficientes. Necesitas ${HINT_COST} puntos.`);
            return;
        }

        try {
            const data = await buyHint(userId, currentQuestion.id, token);
            
            setCurrentHint(data.hintText);
            // ✅ CORREGIDO: SE USA EL VALOR RESTADO DEL BACKEND PARA EL SALDO
            setUserPoints(data.newPoints); 
            
        } catch (err: any) {
            const errorMessage = err.message || 'Error al comprar pista.';
            setHintError(errorMessage);
            console.error("Error comprando pista:", err);
        }
    };


    // ----------------------------------------------------------------
    // --- LÓGICA DE ENVÍO DE RESPUESTA (Vuelve a obtener el saldo) ---
    // ----------------------------------------------------------------
    const checkAndSubmitAnswer = async () => {
        if (selectedOptionId === null || !currentSessionId || !token) return; 

        setIsAnswered(true);

        if (!currentQuestion) return; 

        try {
            const log = await submitAnswer(
                currentSessionId,
                currentQuestion.id,
                {
                    selectedOptionId: selectedOptionId, 
                    responseTimeMs: 500,
                    advantageUsed: currentHint !== null 
                },
                token
            );
            
            if (log.isCorrect) {
                // 1. Aumentar los puntos GANADOS en la SESIÓN
                setScore(prevScore => prevScore + log.pointsGained); 
                
                // 2. 💡 CORRECCIÓN CRÍTICA: Volver a obtener el SALDO TOTAL del usuario
                //    para reflejar los puntos SUMADOS por el backend.
                if (userId) {
                    const updatedPoints = await getInitialUserPoints(userId, token);
                    setUserPoints(updatedPoints);
                }
            }

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
        return (
            <div className="game-wrapper">
                <Navbar isGameSession={true} />
                <div className="loading-container p-6 text-center mt-20">
                    {loading ? `Cargando preguntas de nivel **${difficulty}**...` : error || "No hay preguntas para el juego."}
                </div>
            </div>
        );
    }
    
    // Si llegamos aquí, currentQuestion está definido.
    // const currentQuestion = questions[currentQuestionIndex]; 

    // --- RENDERIZADO PRINCIPAL ---
    return (
        <div className="game-wrapper">
            <Navbar isGameSession={true} /> 

            <div className="game-container">
                <div className="game-header">
                    <span className="difficulty-label">Nivel: {difficulty}</span>
                    <span className="progress">Pregunta {currentQuestionIndex + 1} / {totalQuestions}</span>
                    <span className="score">Puntuación: {score}</span>
                </div>
                
                <div className="user-points-display">
                    Puntos disponibles: 💰 **{userPoints}**
                </div>

                <div className="question-card">
                    <p className="question-text">{currentQuestion.questionText}</p> 
                </div>

                <div className="options-grid">
                    {currentQuestion.options.map((option: ResponseOptionGameDTO) => ( 
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

                {/* ZONA DE CONTROL DE PISTAS */}
                <div className="hint-control-area">
                    {currentHint && <div className="hint-display">💡 Pista: {currentHint}</div>}
                    {hintError && <div className="hint-error">{hintError}</div>}

                    {!isAnswered && !currentHint && (
                        <button
                            onClick={handleBuyHint}
                            disabled={userPoints < HINT_COST}
                            className={`buy-hint-button ${userPoints < HINT_COST ? 'disabled-hint' : ''}`}
                        >
                            Comprar Pista ({HINT_COST} puntos)
                        </button>
                    )}
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