import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 💡 1. IMPORTAR EL PROVEEDOR DE GOOGLE
import { GoogleOAuthProvider } from '@react-oauth/google'; 

// 🛑 2. TU CLIENT ID DE GOOGLE
const GOOGLE_CLIENT_ID = "203925615165-ppgtpa9cmgq1eichb76u0kcr5pmgn8pi.apps.googleusercontent.com"; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 💡 3. ENVOLVER APP CON EL PROVEEDOR Y EL CLIENT ID */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> 
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)