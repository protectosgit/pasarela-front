import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CheckoutFlow from './pages/CheckoutFlow';
import PaymentResultPage from './pages/PaymentResultPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
      <Routes>
          {/* Ruta principal - flujo de checkout */}
          <Route path="/" element={<CheckoutFlow />} />
          
          {/* Página de resultado - cuando regresa de Wompi */}
          <Route path="/payment-result" element={<PaymentResultPage />} />
          
          {/* Redirect cualquier otra ruta a la principal */}
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </Router>
  );
};

export default App;
