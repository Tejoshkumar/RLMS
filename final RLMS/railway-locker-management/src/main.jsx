import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LockerProvider } from './store/LockerStore.jsx'
import { AuthProvider } from './store/AuthStore.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LockerProvider>
          <App />
        </LockerProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
