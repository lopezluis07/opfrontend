import React from 'react';
import ReactDOM from 'react-dom/client'; // Asegúrate de estar usando 'react-dom/client'
import App from './App';
import './index.css';

// Crear la raíz de la aplicación con React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);