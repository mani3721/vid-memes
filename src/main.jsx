import '@fontsource-variable/inter'
import '@fontsource/anton'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConsentProvider } from './consent/ConsentProvider'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConsentProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConsentProvider>
  </StrictMode>,
)
