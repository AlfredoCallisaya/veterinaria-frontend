import React, { useState } from 'react';
import { MdPets } from 'react-icons/md';
import { GrLogin } from 'react-icons/gr';
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-light)',
        overflow: 'hidden',
        padding: '20px 0',
      }}
    >
      <Container fluid>
        {' '}
        {}
        <Row className="justify-content-center m-0">
          {' '}
          {}
          <Col xs={12} sm={8} md={6} lg={4} className="p-0">
            {' '}
            {}
            <Card
              className="shadow border-0 mx-auto"
              style={{ maxWidth: '400px' }}
            >
              {' '}
              {}
              <Card.Body className="p-4">
                {' '}
                {}
                <div className="text-center mb-3">
                  {' '}
                  {}
                  <h1
                    className="fw-bold text-primary mb-2"
                    style={{ fontSize: '2rem' }}
                  >
                    <MdPets className="m-2" />
                    Sistema
                  </h1>
                  <p className="text-muted mb-3">
                    Sistema de Gestión Veterinaria
                  </p>
                  <hr className="my-3" />
                  <h5 className="fw-semibold">
                    <GrLogin className="m-2" />
                    Iniciar Sesión
                  </h5>
                </div>
                {error && (
                  <Alert variant="danger" className="text-center py-2">
                    {error}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Correo electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="usuario@ejemplo.com"
                    />{' '}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Ingresa tu contraseña"
                    />{' '}
                    {/* ← Quitado size="lg" */}
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2"
                    disabled={loading}
                  >
                    {' '}
                    {/* ← Quitado size="lg" */}
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  <small className="text-muted">
                    ¿No tienes cuenta?{' '}
                    <Link
                      to="/register"
                      className="text-decoration-none fw-semibold"
                    >
                      Regístrate aquí
                    </Link>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
