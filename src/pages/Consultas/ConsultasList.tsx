import React, { useState, useEffect } from 'react';
import { PiHospital } from 'react-icons/pi';
import { TiDocumentText } from 'react-icons/ti';
import { IoBarChartSharp } from 'react-icons/io5';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Alert,
  InputGroup,
  Accordion,
} from 'react-bootstrap';
import {
  PlusCircle,
  Search,
  Eye,
  FileMedical,
  Calendar,
} from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import { Mascota, Consulta, Usuario } from '../../types';

const ConsultasList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [veterinarios, setVeterinarios] = useState<Usuario[]>([]);
  const [filteredConsultas, setFilteredConsultas] = useState<Consulta[]>([]);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(
    null
  );
  const [alert, setAlert] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    mascota_id: '',
    veterinario_id: '',
    fecha_consulta: new Date().toISOString().split('T')[0],
    motivo: '',
    diagnostico: '',
    tratamiento: '',
    medicamentos: '',
    observaciones: '',
    costo: 0,
    peso: '',
    temperatura: '',
    estado: 'Completada' as 'Completada' | 'Pendiente' | 'Cancelada',
  });

  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    loadConsultas();
    loadMascotas();
    loadVeterinarios();
  }, []);

  useEffect(() => {
    const filtered = consultas.filter(
      (consulta) =>
        getMascotaNombre(consulta.mascota_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getVeterinarioNombre(consulta.veterinario_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        consulta.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consulta.diagnostico.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConsultas(filtered);
  }, [searchTerm, consultas]);

  const loadConsultas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/consultas`);
      if (response.ok) {
        const consultasData = await response.json();
        setConsultas(consultasData);
      } else {
        throw new Error('Error cargando consultas');
      }
    } catch (error) {
      console.error('Error cargando consultas:', error);
      setAlert({ type: 'danger', message: 'Error al cargar las consultas' });
    } finally {
      setLoading(false);
    }
  };

  const loadMascotas = async () => {
    try {
      const response = await fetch(`${API_URL}/mascotas`);
      if (response.ok) {
        const mascotasData = await response.json();
        setMascotas(mascotasData);
      } else {
        throw new Error('Error cargando mascotas');
      }
    } catch (error) {
      console.error('Error cargando mascotas:', error);
      setAlert({ type: 'danger', message: 'Error al cargar las mascotas' });
    }
  };

  const loadVeterinarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      if (response.ok) {
        const usuariosData = await response.json();
        const vets = usuariosData.filter(
          (u: Usuario) => u.rol_nombre === 'Veterinario'
        );
        setVeterinarios(vets);
      } else {
        throw new Error('Error cargando veterinarios');
      }
    } catch (error) {
      console.error('Error cargando veterinarios:', error);
      setAlert({ type: 'danger', message: 'Error al cargar los veterinarios' });
    }
  };

  const getMascotaNombre = (mascotaId: number | string) => {
    const mascota = mascotas.find((m) => m.id == mascotaId);
    return mascota ? mascota.nombre : 'N/A';
  };

  const getVeterinarioNombre = (veterinarioId: number | string) => {
    const veterinario = veterinarios.find((v) => v.id == veterinarioId);
    return veterinario
      ? `${veterinario.nombre} ${veterinario.apellido}`
      : 'N/A';
  };

  const getClienteNombre = (mascotaId: number | string) => {
    const mascota = mascotas.find((m) => m.id == mascotaId);
    if (!mascota) return 'N/A';

    // En tu estructura, el cliente está en la tabla usuarios
    // Buscamos el usuario dueño de la mascota
    const cliente = veterinarios.find((u) => u.id == mascota.usuario_id);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'N/A';
  };

  const getEstadoBadge = (estado: string) => {
    const variants: { [key: string]: string } = {
      Completada: 'success',
      Pendiente: 'warning',
      Cancelada: 'danger',
    };
    return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
  };

  const getConsultasPorMascota = (mascotaId: number | string) => {
    return consultas
      .filter((consulta) => consulta.mascota_id == mascotaId)
      .sort(
        (a, b) =>
          new Date(b.fecha_consulta).getTime() -
          new Date(a.fecha_consulta).getTime()
      );
  };

  const handleShowModal = (mascota?: Mascota) => {
    if (mascota) {
      setSelectedMascota(mascota);
      setFormData((prev) => ({
        ...prev,
        mascota_id: mascota.id.toString(),
      }));
    } else {
      setSelectedMascota(null);
    }
    setShowModal(true);
  };

  const handleShowDetailModal = (consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const nuevaConsulta = {
        mascota_id: formData.mascota_id,
        veterinario_id: formData.veterinario_id,
        fecha_consulta: formData.fecha_consulta,
        motivo: formData.motivo,
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento,
        medicamentos: formData.medicamentos || undefined,
        observaciones: formData.observaciones || undefined,
        costo: Number(formData.costo),
        peso: formData.peso ? Number(formData.peso) : undefined,
        temperatura: formData.temperatura
          ? Number(formData.temperatura)
          : undefined,
        estado: formData.estado,
      };

      const response = await fetch(`${API_URL}/consultas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaConsulta),
      });

      if (!response.ok) throw new Error('Error creando consulta');

      const createdConsulta = await response.json();
      setConsultas([...consultas, createdConsulta]);
      setAlert({
        type: 'success',
        message: 'Consulta registrada correctamente',
      });
      setShowModal(false);
      setFormData({
        mascota_id: '',
        veterinario_id: '',
        fecha_consulta: new Date().toISOString().split('T')[0],
        motivo: '',
        diagnostico: '',
        tratamiento: '',
        medicamentos: '',
        observaciones: '',
        costo: 0,
        peso: '',
        temperatura: '',
        estado: 'Completada',
      });
    } catch (error) {
      console.error('Error creando consulta:', error);
      setAlert({ type: 'danger', message: 'Error al registrar la consulta' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const canManage =
    currentUser?.rol_nombre === 'Administrador' ||
    currentUser?.rol_nombre === 'Veterinario';

  if (!canManage) {
    return (
      <Container fluid>
        <Row>
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <div className="text-warning mb-3">
                  <FileMedical size={48} />
                </div>
                <h3>Acceso Restringido</h3>
                <p className="text-muted">
                  No tienes permisos para acceder al historial de consultas.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col>
          {alert && <Alert variant={alert.type}>{alert.message}</Alert>}

          {/* Header */}
          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6}>
                  <h3 className="mb-0">
                    <PiHospital className="m-2" />
                    Historial de Consultas
                  </h3>
                  <p className="text-muted mb-0">
                    Gestión del historial médico de las mascotas (
                    {consultas.length} consultas)
                  </p>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar consultas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={2} className="text-end">
                  <Button variant="primary" onClick={() => handleShowModal()}>
                    <PlusCircle className="me-2" />
                    Nueva Consulta
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <TiDocumentText className="m-2" />
                Mascotas con Historial Médico
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {mascotas.map((mascota) => {
                  const consultasMascota = getConsultasPorMascota(mascota.id);
                  return (
                    <Col md={6} lg={4} key={mascota.id} className="mb-3">
                      <Card>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">{mascota.nombre}</h6>
                              <small className="text-muted">
                                {mascota.especie} • {mascota.raza} •{' '}
                                {mascota.edad} años
                              </small>
                              <br />
                              <small className="text-muted">
                                Dueño: {getClienteNombre(mascota.id)}
                              </small>
                            </div>
                            <Badge
                              bg={
                                consultasMascota.length > 0
                                  ? 'primary'
                                  : 'secondary'
                              }
                            >
                              {consultasMascota.length} consultas
                            </Badge>
                          </div>

                          {consultasMascota.length > 0 ? (
                            <Accordion>
                              <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                  <small>Ver historial médico</small>
                                </Accordion.Header>
                                <Accordion.Body className="p-0">
                                  <Table size="sm" className="mb-0">
                                    <thead>
                                      <tr>
                                        <th>Fecha</th>
                                        <th>Motivo</th>
                                        <th></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {consultasMascota
                                        .slice(0, 3)
                                        .map((consulta) => (
                                          <tr key={consulta.id}>
                                            <td>
                                              <small>
                                                {new Date(
                                                  consulta.fecha_consulta
                                                ).toLocaleDateString()}
                                              </small>
                                            </td>
                                            <td>
                                              <small
                                                className="text-truncate d-inline-block"
                                                style={{ maxWidth: '120px' }}
                                              >
                                                {consulta.motivo}
                                              </small>
                                            </td>
                                            <td className="text-end">
                                              <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() =>
                                                  handleShowDetailModal(
                                                    consulta
                                                  )
                                                }
                                              >
                                                <Eye size={12} />
                                              </Button>
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </Table>
                                  {consultasMascota.length > 3 && (
                                    <div className="text-center p-2">
                                      <small className="text-muted">
                                        +{consultasMascota.length - 3} consultas
                                        más
                                      </small>
                                    </div>
                                  )}
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                          ) : (
                            <div className="text-center py-2">
                              <small className="text-muted">
                                Sin historial médico
                              </small>
                            </div>
                          )}

                          <div className="text-center mt-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowModal(mascota)}
                            >
                              <PlusCircle size={12} className="me-1" />
                              Nueva Consulta
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <IoBarChartSharp className="m-2" />
                Todas las Consultas
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Mascota</th>
                    <th>Dueño</th>
                    <th>Veterinario</th>
                    <th>Motivo</th>
                    <th>Costo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsultas.map((consulta) => (
                    <tr key={consulta.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Calendar size={14} />
                          {new Date(
                            consulta.fecha_consulta
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <strong>{getMascotaNombre(consulta.mascota_id)}</strong>
                        <br />
                        <small className="text-muted">
                          {
                            mascotas.find((m) => m.id == consulta.mascota_id)
                              ?.especie
                          }
                        </small>
                      </td>
                      <td>
                        <small>{getClienteNombre(consulta.mascota_id)}</small>
                      </td>
                      <td>
                        <small>
                          {getVeterinarioNombre(consulta.veterinario_id)}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">{consulta.motivo}</small>
                      </td>
                      <td>
                        <Badge bg="success">Bs.{consulta.costo}</Badge>
                      </td>
                      <td>{getEstadoBadge(consulta.estado)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleShowDetailModal(consulta)}
                        >
                          <Eye size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {filteredConsultas.length === 0 && !loading && (
                <div className="text-center py-5">
                  <p className="text-muted">No se encontraron consultas</p>
                  <Button variant="primary" onClick={() => handleShowModal()}>
                    Registrar Primera Consulta
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Nueva Consulta */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedMascota
              ? `Nueva Consulta - ${selectedMascota.nombre}`
              : 'Nueva Consulta Médica'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mascota *</Form.Label>
                  <Form.Select
                    value={formData.mascota_id}
                    onChange={(e) =>
                      setFormData({ ...formData, mascota_id: e.target.value })
                    }
                    required
                    disabled={!!selectedMascota}
                  >
                    <option value="">Seleccionar mascota...</option>
                    {mascotas.map((mascota) => (
                      <option key={mascota.id} value={mascota.id}>
                        {mascota.nombre} ({mascota.especie}) -{' '}
                        {getClienteNombre(mascota.id)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Veterinario *</Form.Label>
                  <Form.Select
                    value={formData.veterinario_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        veterinario_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Seleccionar veterinario...</option>
                    {veterinarios.map((vet) => (
                      <option key={vet.id} value={vet.id}>
                        {vet.nombre} {vet.apellido}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Consulta *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.fecha_consulta}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fecha_consulta: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Peso (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formData.peso}
                    onChange={(e) =>
                      setFormData({ ...formData, peso: e.target.value })
                    }
                    placeholder="Ej: 5.2"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Temperatura (°C)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={formData.temperatura}
                    onChange={(e) =>
                      setFormData({ ...formData, temperatura: e.target.value })
                    }
                    placeholder="Ej: 38.5"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Motivo de la Consulta *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.motivo}
                onChange={(e) =>
                  setFormData({ ...formData, motivo: e.target.value })
                }
                placeholder="Describa el motivo de la consulta..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Diagnóstico *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.diagnostico}
                onChange={(e) =>
                  setFormData({ ...formData, diagnostico: e.target.value })
                }
                placeholder="Diagnóstico médico..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tratamiento *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.tratamiento}
                onChange={(e) =>
                  setFormData({ ...formData, tratamiento: e.target.value })
                }
                placeholder="Tratamiento prescrito..."
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Medicamentos</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.medicamentos}
                    onChange={(e) =>
                      setFormData({ ...formData, medicamentos: e.target.value })
                    }
                    placeholder="Medicamentos recetados..."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.observaciones}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observaciones: e.target.value,
                      })
                    }
                    placeholder="Observaciones adicionales..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Costo (Bs.) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.costo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        costo: Number(e.target.value),
                      })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado *</Form.Label>
                  <Form.Select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estado: e.target.value as
                          | 'Completada'
                          | 'Pendiente'
                          | 'Cancelada',
                      })
                    }
                  >
                    <option value="Completada">Completada</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Cancelada">Cancelada</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Consulta'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Detalles de Consulta */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalles de Consulta Médica</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConsulta && (
            <Row>
              <Col md={6}>
                <h6>Información General</h6>
                <Table size="sm" borderless>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Mascota:</strong>
                      </td>
                      <td>{getMascotaNombre(selectedConsulta.mascota_id)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Dueño:</strong>
                      </td>
                      <td>{getClienteNombre(selectedConsulta.mascota_id)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Veterinario:</strong>
                      </td>
                      <td>
                        {getVeterinarioNombre(selectedConsulta.veterinario_id)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Fecha:</strong>
                      </td>
                      <td>
                        {new Date(
                          selectedConsulta.fecha_consulta
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Estado:</strong>
                      </td>
                      <td>{getEstadoBadge(selectedConsulta.estado)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Costo:</strong>
                      </td>
                      <td>${selectedConsulta.costo}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h6>Signos Vitales</h6>
                <Table size="sm" borderless>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Peso:</strong>
                      </td>
                      <td>
                        {selectedConsulta.peso
                          ? `${selectedConsulta.peso} kg`
                          : 'No registrado'}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Temperatura:</strong>
                      </td>
                      <td>
                        {selectedConsulta.temperatura
                          ? `${selectedConsulta.temperatura} °C`
                          : 'No registrada'}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>

              <Col md={12} className="mt-3">
                <h6>Motivo de Consulta</h6>
                <Card>
                  <Card.Body>
                    <p>{selectedConsulta.motivo}</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mt-3">
                <h6>Diagnóstico</h6>
                <Card>
                  <Card.Body>
                    <p>{selectedConsulta.diagnostico}</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mt-3">
                <h6>Tratamiento</h6>
                <Card>
                  <Card.Body>
                    <p>{selectedConsulta.tratamiento}</p>
                  </Card.Body>
                </Card>
              </Col>

              {selectedConsulta.medicamentos && (
                <Col md={6} className="mt-3">
                  <h6>Medicamentos</h6>
                  <Card>
                    <Card.Body>
                      <p>{selectedConsulta.medicamentos}</p>
                    </Card.Body>
                  </Card>
                </Col>
              )}

              {selectedConsulta.observaciones && (
                <Col md={6} className="mt-3">
                  <h6>Observaciones</h6>
                  <Card>
                    <Card.Body>
                      <p>{selectedConsulta.observaciones}</p>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ConsultasList;
