import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ClientesList from './pages/Clientes/ClientesList';
import MascotasList from './pages/Mascotas/MascotasList';
import CitasList from './pages/Citas/CitasList';
import ConsultasList from './pages/Consultas/ConsultasList';
import FacturasList from './pages/Facturacion/FacturasList';
import UserManagement from './pages/Users/UserManagement'; 

const TreatmentsList = () => (
  <div className="container mt-4">
    <div className="alert alert-info">
      <h3>Gestión de Tratamientos</h3>
      <p className="mb-0">
        Catálogo de tratamientos y servicios veterinarios - Próximamente.
      </p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: '3rem', height: '3rem' }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Inicializando VetSystem...</h5>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        {}
        <Route path="/" element={<Home />} />
        <Route path="/clientes" element={<ClientesList />} />
        <Route path="/mascotas" element={<MascotasList />} />
        <Route path="/citas" element={<CitasList />} />
        <Route path="/consultas" element={<ConsultasList />} />
        <Route path="/facturas" element={<FacturasList />} />
        <Route path="/gestion-usuarios" element={<UserManagement />} />{' '}
       
        <Route path="/tratamientos" element={<TreatmentsList />} />
       
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
};
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
