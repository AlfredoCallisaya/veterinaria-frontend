import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaChartBar, 
  FaRocket, 
  FaCalendarAlt, 
  FaUserPlus, 
  FaPaw 
} from "react-icons/fa";

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0 d-flex align-items-center gap-2">
                <FaHome size={20} />
                Panel Principal
              </h3>
            </Card.Header>
            <Card.Body>
              <h4>
                Bienvenido {user?.nombre} {user?.apellido}!
              </h4>
              <p className="text-muted">Rol: {user?.rol_nombre}</p>

              <Row className="mt-4">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <h5 className="d-flex align-items-center gap-2">
                        <FaChartBar />
                        Resumen del Sistema
                      </h5>
                      <p>
                        Gestiona todas las operaciones de tu veterinaria desde
                        aquí.
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <h5 className="d-flex align-items-center gap-2">
                        <FaRocket />
                        Acciones Rápidas
                      </h5>
                      <ul className="list-unstyled">
                        <li className="d-flex align-items-center gap-2 mb-2">
                          <FaCalendarAlt size={14} />
                          Agendar nueva cita
                        </li>
                        <li className="d-flex align-items-center gap-2 mb-2">
                          <FaUserPlus size={14} />
                          Registrar nuevo cliente
                        </li>
                        <li className="d-flex align-items-center gap-2">
                          <FaPaw size={14} />
                          Agregar mascota
                        </li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;