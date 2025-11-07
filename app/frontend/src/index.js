import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Ако имате глобален CSS файл
import App from './App'; // Вашата основна React компонента

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);