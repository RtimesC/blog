import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { installAssetPolicy } from './config/assetPolicy.js'

if (typeof window !== 'undefined') {
  installAssetPolicy();
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
