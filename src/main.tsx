import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'github-markdown-css/github-markdown.css'
import 'katex/dist/katex.min.css'
import App from './App.tsx'
import { AuthProvider } from './hooks/useAuth.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
