// src/components/WordRain.tsx

import React, { useEffect, useState } from 'react';
import '../styles/Auth.css'; 

// Diccionario de palabras en inglés para la lluvia
const ENGLISH_WORDS = [
  'Language', 'Learn', 'Game', 'Level', 'Star', 
  'Point', 'Word', 'Grammar', 'Hello', 'Play', 
  'Quiz', 'Goal', 'Fluent', 'Skill', 'Fun', 
  'Explore', 'Victory', 'Challenge', 'Awesome'
];

// Interfaz para el estado de cada palabra
interface Word {
  id: number;
  text: string;
  left: number;       
  size: number;       
  duration: number;   
  delay: number;      
}

const WordRain: React.FC = () => {
  const WORD_COUNT = 40; 
  const [words, setWords] = useState<Word[]>([]);
  
  useEffect(() => {
    const generatedWords: Word[] = [];
    
    for (let i = 0; i < WORD_COUNT; i++) {
      // Duración: 15s a 30s
      const duration = Math.floor(Math.random() * 15) + 15; 
      
      generatedWords.push({
        id: i,
        text: ENGLISH_WORDS[Math.floor(Math.random() * ENGLISH_WORDS.length)],
        left: Math.floor(Math.random() * 100), 
        size: Math.floor(Math.random() * 10) + 12, 
        duration: duration, 
        // CLAVE: Retraso negativo agresivo. 
        // Lo fijamos a un valor que garantiza que la palabra esté visible 
        // en algún punto de la pantalla al cargar.
        delay: Math.floor(Math.random() * duration) * -1, 
      });
    }
    setWords(generatedWords);
  }, []);

  return (
    <div className="word-rain-background">
      {words.map(word => (
        <span
          key={word.id}
          className="word"
          style={{
            left: `${word.left}%`,
            fontSize: `${word.size}px`,
            // Aplicamos ambas animaciones
            animation: `
              fall ${word.duration}s linear ${word.delay}s infinite, 
              float-lateral ${word.duration * 0.7}s ease-in-out infinite
            `,
            color: `var(--color-accent)`, 
            opacity: Math.random() * 0.5 + 0.3 
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
};

export default WordRain;