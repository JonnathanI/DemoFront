import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importación por defecto compatible con tu 'export default useAuthStore;'
import useAuthStore from '../store/authStore'; 
import '../styles/CreateQuestion.css'; 

// --- DTO Types (Pregunta) ---
// Coinciden con QuestionCreationDTO y ResponseOptionDTO de tu backend Kotlin/Spring
interface ResponseOptionDTO {
    optionText: string;
    isCorrect: boolean;
}

interface QuestionCreationDTO {
    questionText: string;
    mediaUrl: string | null; 
    difficultyLevel: string;
    pointsAwarded: number;
    category: string;
    options: ResponseOptionDTO[];
}

interface QuestionState {
    questionText: string;
    mediaFile: File | null; 
    difficultyLevel: string;
    pointsAwarded: number;
    category: string;
    options: ResponseOptionDTO[];
}

// --- Definición de Tipos de AuthStore para el componente ---
// Tipos de usuario con roles 'USER' y 'ADMIN' para coincidir con tu store
interface UserData {
    id: number;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN'; 
}

interface AuthStoreState {
    token: string | null;
    user: UserData | null; 
    isLoggedIn: boolean;
}


// --- Mock Data y Constantes ---
const DIFFICULTY_LEVELS = ['Fácil', 'Normal', 'Difícil'];
const CATEGORIES = ['Gramática', 'Vocabulario', 'Comprensión Lectora', 'Audio'];
const POINTS_OPTIONS = [100, 200, 300, 500];


const CreateQuestion: React.FC = () => {
    const navigate = useNavigate();
    
    // Obtenemos el token y el usuario del store con tipado explícito
    const token = useAuthStore((state: AuthStoreState) => state.token);
    const user = useAuthStore((state: AuthStoreState) => state.user);
    
    const [formData, setFormData] = useState<QuestionState>({
        questionText: '',
        mediaFile: null,
        difficultyLevel: DIFFICULTY_LEVELS[0],
        pointsAwarded: POINTS_OPTIONS[0],
        category: CATEGORIES[0],
        options: [
            { optionText: '', isCorrect: true }, 
            { optionText: '', isCorrect: false }, 
        ],
    });
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Handlers de Formulario ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePointsChange = (points: number) => {
        setFormData(prev => ({ ...prev, pointsAwarded: points }));
    };

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, mediaFile: file }));
            setFilePreview(URL.createObjectURL(file));
        } else {
             setFormData(prev => ({ ...prev, mediaFile: null }));
             setFilePreview(null);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = formData.options.map((opt, i) => 
            i === index ? { ...opt, optionText: value } : opt
        );
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleCorrectToggle = (index: number) => {
        const newOptions = formData.options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index ? true : false, // Solo una puede ser correcta
        }));
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        setError(null);
        if (formData.options.length < 4) {
            setFormData(prev => ({ ...prev, options: [...prev.options, { optionText: '', isCorrect: false }] }));
        } else {
            setError("Solo se permiten hasta 4 opciones de respuesta.");
        }
    };

    const removeOption = (index: number) => {
        setError(null);
        if (formData.options.length > 2) {
            // Si la opción eliminada era la correcta, forzamos que la primera restante sea correcta.
            let newOptions = formData.options.filter((_, i) => i !== index);
            if (formData.options[index].isCorrect && newOptions.length > 0) {
                 newOptions = newOptions.map((opt, i) => ({ ...opt, isCorrect: i === 0 }));
            }
            setFormData(prev => ({ ...prev, options: newOptions }));
        } else {
            setError("Debe haber al menos 2 opciones de respuesta.");
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // 1. Validación de Token y Rol
        if (!token) {
            setError("No ha iniciado sesión. Por favor, inicie sesión.");
            return;
        }
        if (user?.role !== 'ADMIN') { // Usamos 'ADMIN' sin prefijo
             setError("Acceso denegado. Solo los administradores pueden crear preguntas.");
            return;
        }

        // 2. Validación de Formulario
        const optionsValid = formData.options.every(opt => opt.optionText.trim() !== '');
        const correctCount = formData.options.filter(opt => opt.isCorrect).length;

        if (!optionsValid || correctCount !== 1 || formData.questionText.trim() === '') {
            setError('Rellena todos los campos. Debe haber una y solo una respuesta correcta.');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // 3. Preparación del Payload (Simulación de Media URL)
            // NOTA: Aquí deberías implementar la subida real del archivo (e.g., a S3, Cloudinary)
            // y obtener la URL real. Esto es un mock temporal.
            const uploadedMediaUrl: string | null = formData.mediaFile 
                ? `mock-uploaded-url/${formData.mediaFile.name}`
                : null;
            
            const finalPayload: QuestionCreationDTO = {
                questionText: formData.questionText,
                difficultyLevel: formData.difficultyLevel,
                pointsAwarded: formData.pointsAwarded,
                category: formData.category,
                options: formData.options,
                mediaUrl: uploadedMediaUrl,
            };
            
            // 4. Llamada al Backend (POST /api/questions)
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(finalPayload)
            });

            if (!response.ok) {
                const errorDetail = await response.text(); 
                if (response.status === 403) {
                    throw new Error(`Acceso denegado (403). Su usuario (${user?.username}) no tiene rol ADMIN.`);
                }
                throw new Error(`Error ${response.status} al guardar: ${errorDetail}`);
            }

            console.log("Pregunta guardada con éxito.");
            alert('Pregunta creada exitosamente en la base de datos.');
            navigate('/dashboard'); // Redirigir al panel de administración

        } catch (err) {
            console.error("Error en la solicitud:", err);
            setError(`Ocurrió un error: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- JSX Renderizado ---
    
    // Estado de "Acceso Denegado"
    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="error-state-container">
                <h1>Acceso Denegado</h1>
                <p>Necesitas el rol de Administrador para crear preguntas.</p>
                <button onClick={() => navigate('/login')}>Ir a Iniciar Sesión</button>
            </div>
        );
    }

    return (
        <div className="create-question-container">
            <h1 className="form-title">📝 Generar Nueva Pregunta</h1>
            <p className="form-subtitle">Usuario: {user.username} ({user.role})</p>
            
            <form onSubmit={handleSubmit} className="question-form">
                {error && <p className="form-error-message">{error}</p>} 

                {/* --- SECCIÓN 1: Contenido de la Pregunta --- */}
                <div className="form-section">
                    <h3>1. Contenido Principal</h3>
                    <label htmlFor="questionText">Texto de la Pregunta</label>
                    <textarea
                        id="questionText"
                        name="questionText"
                        value={formData.questionText}
                        onChange={handleInputChange}
                        required
                        placeholder="Escribe aquí la pregunta..."
                    />
                </div>

                {/* --- SECCIÓN 2: Opciones de Respuesta --- */}
                <div className="form-section options-section">
                    <h3>2. Opciones y Respuesta Correcta</h3>
                    {formData.options.map((option, index) => (
                        <div key={index} className="option-input-group">
                            <input
                                type="text"
                                value={option.optionText}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Opción ${index + 1}`}
                                required
                            />
                            <button
                                type="button"
                                className={`correct-toggle ${option.isCorrect ? 'is-correct' : ''}`}
                                onClick={() => handleCorrectToggle(index)}
                                title="Marcar como respuesta correcta"
                            >
                                {option.isCorrect ? '✅ Correcta' : '❌ Marcar'}
                            </button>
                            {formData.options.length > 2 && (
                                <button type="button" className="remove-option" onClick={() => removeOption(index)} title="Eliminar opción">
                                    🗑️
                                </button>
                            )}
                        </div>
                    ))}
                    {formData.options.length < 4 && (
                        <button type="button" className="add-option-button" onClick={addOption}>
                            + Añadir Opción
                        </button>
                    )}
                </div>

                {/* --- SECCIÓN 3: Metadatos y Media --- */}
                <div className="form-section metadata-section">
                    <h3>3. Metadatos</h3>

                    <div className="metadata-row">
                        <label>
                            Categoría:
                            <select name="category" value={formData.category} onChange={handleInputChange}>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </label>

                        <label>
                            Dificultad:
                            <select name="difficultyLevel" value={formData.difficultyLevel} onChange={handleInputChange}>
                                {DIFFICULTY_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                            </select>
                        </label>
                    </div>
                    
                    <label>
                        Puntos Otorgados:
                        <div className="points-selector">
                            {POINTS_OPTIONS.map(points => (
                                <button
                                    type="button"
                                    key={points}
                                    className={`point-button ${formData.pointsAwarded === points ? 'selected' : ''}`}
                                    onClick={() => handlePointsChange(points)}
                                >
                                    {points}
                                </button>
                            ))}
                        </div>
                    </label>

                    <label className="media-upload-label">
                        Media (Opcional: Imagen/Audio):
                        <input type="file" onChange={handleMediaChange} accept="image/*,audio/*" />
                    </label>
                    {filePreview && (
                        <p className="file-preview-text">Archivo cargado: {formData.mediaFile?.name}</p>
                    )}
                </div>

                <div className="form-action-buttons">
                    <button type="submit" className="submit-question-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Pregunta'}
                    </button>
                    <button type="button" className="cancel-button" onClick={() => navigate('/dashboard')}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateQuestion;