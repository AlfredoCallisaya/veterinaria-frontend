import React, { useState } from 'react';
import { MdPets } from 'react-icons/md';
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

interface RegisterData {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  direccion: string;
  contrasena: string;
  confirmarContrasena: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: '',
    contrasena: '',
    confirmarContrasena: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.nombres.trim() || !formData.apellidos.trim()) {
      setError('Nombre y apellido son obligatorios');
      return false;
    }

    if (!formData.correo.trim()) {
      setError('El correo electrónico es obligatorio');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      setError('El formato del correo electrónico no es válido');
      return false;
    }

    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateForm()) {
        return;
      }

      console.log(' Registrando usuario:', formData);

      const usuariosRegistrados = JSON.parse(
        localStorage.getItem('vetUsers') || '[]'
      );
      const nuevoUsuario = {
        id: Date.now(), 
        ...formData,
        rol_nombre: 'Dueño', 
        fechaRegistro: new Date().toISOString(),
      };

      usuariosRegistrados.push(nuevoUsuario);
      localStorage.setItem('vetUsers', JSON.stringify(usuariosRegistrados));

      await login(formData.correo, formData.contrasena);

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(
        'Error al registrar usuario: ' + (err.message || 'Error desconocido')
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          <Row className="justify-content-center m-0">
            <Col xs={12} sm={8} md={6} lg={4} className="p-0">
              <Card
                className="shadow border-0 text-center mx-auto"
                style={{ maxWidth: '400px' }}
              >
                <Card.Body className="p-4">
                  <div className="text-success mb-3">
                    <span style={{ fontSize: '3rem' }}></span>
                  </div>
                  <h3 className="fw-bold text-success mb-3">
                    ¡Registro Exitoso!
                  </h3>
                  <p className="text-muted mb-3">
                    Tu cuenta ha sido creada correctamente. Serás redirigido al
                    dashboard.
                  </p>
                  <Spinner animation="border" variant="success" />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

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
        <Row className="justify-content-center m-0">
          <Col xs={12} sm={10} md={8} lg={6} className="p-0">
            <Card
              className="shadow border-0 mx-auto"
              style={{ maxWidth: '600px' }}
            >
              <Card.Body className="p-4">
                {' '}
                {}
                <div className="text-center mb-3">
                  {' '}
                  {}
                  <h1
                    className="fw-bold text-primary mb-2"
                    style={{ fontSize: '1.8rem' }}
                  >
                    <MdPets className="m-2" />
                    Sistema
                  </h1>
                  <p className="text-muted mb-2">Crear Cuenta Nueva</p>{' '}
                  {}
                  <hr className="my-3" /> {}
                  <h5 className="fw-semibold">Registro de Usuario</h5>
                </div>
                {error && (
                  <Alert variant="danger" className="text-center py-2">
                    {' '}
                    {}
                    {error}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        {' '}
                        {}
                        <Form.Label className="small fw-semibold">
                          Nombres *
                        </Form.Label>{' '}
                        {}
                        <Form.Control
                          type="text"
                          name="nombres"
                          value={formData.nombres}
                          onChange={handleChange}
                          required
                          placeholder="Ingresa tus nombres"
                         
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        {' '}
                        {}
                        <Form.Label className="small fw-semibold">
                          Apellidos *
                        </Form.Label>{' '}
                        {}
                        <Form.Control
                          type="text"
                          name="apellidos"
                          value={formData.apellidos}
                          onChange={handleChange}
                          required
                          placeholder="Ingresa tus apellidos"
                        
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-2">
                    {' '}
                    {}
                    <Form.Label className="small fw-semibold">
                      Correo Electrónico *
                    </Form.Label>{' '}
                    {}
                    <Form.Control
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      required
                      placeholder="usuario@ejemplo.com"
                   
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        {' '}
                        {}
                        <Form.Label className="small fw-semibold">
                          Teléfono
                        </Form.Label>{' '}
                        {}
                        <Form.Control
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          placeholder="Ej: 555-1234"
                
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        {' '}
                        {}
                        <Form.Label className="small fw-semibold">
                          Dirección
                        </Form.Label>{' '}
                        {}
                        <Form.Control
                          type="text"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                          placeholder="Tu dirección"
                    
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        {' '}
                        {}
                        <Form.Label className="small fw-semibold">
                          Contraseña *
                        </Form.Label>{' '}
                        {}
                        <Form.Control
                          type="password"
                          name="contrasena"
                          value={formData.contrasena}
                          onChange={handleChange}
                          required
                          placeholder="Mínimo 6 caracteres"
                  
                        />
                        <Form.Text className="text-muted small">
                          {' '}
                          {}
                          Mínimo 6 caracteres
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        {' '}
                        {}
                        <Form.Label className="small fw-semibold">
                          Confirmar Contraseña *
                        </Form.Label>{' '}
                        {}
                        <Form.Control
                          type="password"
                          name="confirmarContrasena"
                          value={formData.confirmarContrasena}
                          onChange={handleChange}
                          required
                          placeholder="Repite tu contraseña"
                      
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2"
                    disabled={loading}
              
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Registrando...
                      </>
                    ) : (
                      'Crear Cuenta'
                    )}
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  {' '}
                  {}
                  <small className="text-muted">
                    ¿Ya tienes cuenta?{' '}
                    <Link
                      to="/login"
                      className="text-decoration-none fw-semibold"
                    >
                      Inicia Sesión
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

export default RegisterPage;
