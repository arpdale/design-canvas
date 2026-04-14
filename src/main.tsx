import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@david-richard/ds-blossom/styles.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
