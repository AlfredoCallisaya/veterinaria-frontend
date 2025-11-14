import React, { useState, useEffect } from 'react';
import { IoCalendarOutline } from 'react-icons/io5';
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
  Dropdown,
} from 'react-bootstrap';
import {
  PlusCircle,
  Search,
  ThreeDotsVertical,
  Calendar,
  Clock,
} from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import type { Cita, Mascota, Usuario } from '../../types';

const CitasList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [veterinarios, setVeterinarios] = useState<Usuario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]); // Para dueños de mascotas
  const [filteredCitas, setFilteredCitas] = useState<Cita[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    mascota_id: '',
    usuario_id: '', // veterinario_id
    fechaCita: '',
    horaCita: '',
    motivo: '',
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const API_URL = 'http://localhost:3001';

  const horariosLaborales = {
    semana: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
    finSemana: ['09:00', '10:00', '11:00'],
  };

  useEffect(() => {
    loadCitas();
    loadMascotas();
    loadVeterinarios();
    loadUsuarios();
  }, []);

  useEffect(() => {
    const filtered = citas.filter(
      (cita) =>
        getMascotaNombre(cita.mascota_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getVeterinarioNombre(cita.usuario_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cita.fechaCita.includes(searchTerm) ||
        cita.motivo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCitas(filtered);
  }, [searchTerm, citas]);

  const loadCitas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/citas`);
      if (response.ok) {
        const citasData = await response.json();
        setCitas(citasData);
      } else {
        // ❌ ELIMINADO: setCitas(mockData.citas || []);
        // ✅ REEMPLAZADO POR:
        setCitas([]);
        console.warn(
          'No se pudieron cargar las citas. Verifique el endpoint /citas en JSON Server.'
        );
      }
    } catch (error) {
      console.error('Error cargando citas:', error);
      // ❌ ELIMINADO: setCitas(mockData.citas || []);
      // ✅ REEMPLAZADO POR:
      setCitas([]);
      setAlert({
        type: 'danger',
        message:
          'Error al cargar las citas. Verifique que JSON Server esté ejecutándose.',
      });
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
        // ❌ ELIMINADO: setMascotas(mockData.mascotas);
        // ✅ REEMPLAZADO POR:
        setMascotas([]);
        console.warn(
          'No se pudieron cargar las mascotas. Verifique el endpoint /mascotas en JSON Server.'
        );
      }
    } catch (error) {
      console.error('Error cargando mascotas:', error);
      // ❌ ELIMINADO: setMascotas(mockData.mascotas);
      // ✅ REEMPLAZADO POR:
      setMascotas([]);
    }
  };

  const loadVeterinarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      if (response.ok) {
        const usuariosData = await response.json();
        const vets = usuariosData.filter(
          (u: Usuario) =>
            u.rol_nombre === 'Veterinario' && u.estado === 'Activo'
        );
        setVeterinarios(vets);
      } else {
        // ❌ ELIMINADO: const vets = mockData.usuarios.filter(...);
        // ✅ REEMPLAZADO POR:
        setVeterinarios([]);
        console.warn(
          'No se pudieron cargar los veterinarios. Verifique el endpoint /usuarios en JSON Server.'
        );
      }
    } catch (error) {
      console.error('Error cargando veterinarios:', error);
      // ❌ ELIMINADO: const vets = mockData.usuarios.filter(...);
      // ✅ REEMPLAZADO POR:
      setVeterinarios([]);
    }
  };

  const loadUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      if (response.ok) {
        const usuariosData = await response.json();
        setUsuarios(usuariosData);
      } else {
        // ❌ ELIMINADO: setUsuarios(mockData.usuarios);
        // ✅ REEMPLAZADO POR:
        setUsuarios([]);
        console.warn(
          'No se pudieron cargar los usuarios. Verifique el endpoint /usuarios en JSON Server.'
        );
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      // ❌ ELIMINADO: setUsuarios(mockData.usuarios);
      // ✅ REEMPLAZADO POR:
      setUsuarios([]);
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

  const getDueñoMascota = (mascotaId: number | string) => {
    const mascota = mascotas.find((m) => m.id == mascotaId);
    if (!mascota) return 'N/A';

    const dueño = usuarios.find((u) => u.id == mascota.usuario_id);
    return dueño ? `${dueño.nombre} ${dueño.apellido}` : 'N/A';
  };

  const getEstadoBadge = (estado: string) => {
    const variants: { [key: string]: string } = {
      Agendada: 'warning',
      Completada: 'success',
      Cancelada: 'danger',
    };
    return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
  };

  const generateWeekDates = (startDate: Date) => {
    const dates = [];
    const current = new Date(startDate);
    current.setDate(current.getDate() - current.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const getAvailableTimeSlots = (date: Date) => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseSlots = isWeekend
      ? horariosLaborales.finSemana
      : horariosLaborales.semana;

    const citasDelDia = citas.filter(
      (cita) =>
        cita.fechaCita === date.toISOString().split('T')[0] &&
        cita.estado !== 'Cancelada'
    );

    const horariosOcupados = citasDelDia.map((cita) => cita.horaCita);

    return baseSlots.filter((slot) => !horariosOcupados.includes(slot));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const slots = getAvailableTimeSlots(date);
    setAvailableSlots(slots);
    setFormData((prev) => ({
      ...prev,
      fechaCita: date.toISOString().split('T')[0],
    }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData((prev) => ({ ...prev, horaCita: time }));
    setShowCalendarModal(false);
    setShowModal(true);
  };

  const handleShowCalendar = () => {
    setSelectedDate(new Date());
    const slots = getAvailableTimeSlots(new Date());
    setAvailableSlots(slots);
    setShowCalendarModal(true);
    setFormData({
      mascota_id: '',
      usuario_id: '',
      fechaCita: '',
      horaCita: '',
      motivo: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.mascota_id || !formData.usuario_id || !formData.motivo) {
      setAlert({
        type: 'danger',
        message: 'Todos los campos son requeridos',
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    if (!formData.fechaCita || !formData.horaCita) {
      setAlert({
        type: 'danger',
        message: 'Debe seleccionar fecha y hora',
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setLoading(true);

    try {
      const nuevaCita = {
        mascota_id: formData.mascota_id,
        usuario_id: formData.usuario_id,
        fechaCita: formData.fechaCita,
        horaCita: formData.horaCita,
        motivo: formData.motivo,
        estado: 'Agendada' as const,
        fechaRegistro: new Date().toISOString(),
      };

      const response = await fetch(`${API_URL}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaCita),
      });

      if (!response.ok) throw new Error('Error creando cita');

      const createdCita = await response.json();
      setCitas([...citas, createdCita]);
      setAlert({ type: 'success', message: 'Cita agendada correctamente' });
      setShowModal(false);
    } catch (error) {
      console.error('Error creando cita:', error);
      setAlert({ type: 'danger', message: 'Error al agendar la cita' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const cambiarEstadoCita = async (
    cita: Cita,
    nuevoEstado: 'Completada' | 'Cancelada'
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/citas/${cita.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) throw new Error('Error actualizando cita');

      const updatedCita = await response.json();
      const updatedCitas = citas.map((c) =>
        c.id === cita.id ? updatedCita : c
      );
      setCitas(updatedCitas);
      setAlert({
        type: 'success',
        message: `Cita ${nuevoEstado.toLowerCase()} correctamente`,
      });
    } catch (error) {
      console.error('Error actualizando cita:', error);
      setAlert({ type: 'danger', message: 'Error al actualizar la cita' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const weekDates = generateWeekDates(selectedDate);

  const canManage =
    currentUser?.rol_nombre === 'Administrador' ||
    currentUser?.rol_nombre === 'Veterinario' ||
    currentUser?.rol_nombre === 'Secretaria';

  if (!canManage) {
    return (
      <Container fluid>
        <Row>
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <div className="text-warning mb-3">
                  <Calendar size={48} />
                </div>
                <h3>Acceso Restringido</h3>
                <p className="text-muted">
                  No tienes permisos para acceder a la gestión de citas.
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

          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6}>
                  <h3 className="mb-0">
                    <IoCalendarOutline className="m-2" />
                    Gestión de Citas
                  </h3>
                  <p className="text-muted mb-0">
                    Administra las citas del sistema ({citas.length} citas)
                  </p>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar citas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={loading}
                    />
                  </InputGroup>
                </Col>
                <Col md={2} className="text-end">
                  <Button
                    variant="primary"
                    onClick={handleShowCalendar}
                    disabled={loading || mascotas.length === 0}
                  >
                    <PlusCircle className="me-2" />
                    Nueva Cita
                  </Button>
                </Col>
              </Row>
              {mascotas.length === 0 && (
                <Alert variant="warning" className="mt-2 mb-0">
                  <small>
                    No hay mascotas registradas. Debe crear mascotas primero
                    para agendar citas.
                  </small>
                </Alert>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Mascota</th>
                    <th>Dueño</th>
                    <th>Veterinario</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCitas.map((cita) => (
                    <tr key={cita.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Calendar size={14} />
                          {new Date(cita.fechaCita).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Clock size={14} />
                          {cita.horaCita}
                        </div>
                      </td>
                      <td>{getMascotaNombre(cita.mascota_id)}</td>
                      <td>
                        <small>{getDueñoMascota(cita.mascota_id)}</small>
                      </td>
                      <td>{getVeterinarioNombre(cita.usuario_id)}</td>
                      <td>
                        <small className="text-muted">{cita.motivo}</small>
                      </td>
                      <td>{getEstadoBadge(cita.estado)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="light"
                            size="sm"
                            disabled={loading}
                          >
                            <ThreeDotsVertical />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {cita.estado === 'Agendada' && (
                              <>
                                <Dropdown.Item
                                  onClick={() =>
                                    cambiarEstadoCita(cita, 'Completada')
                                  }
                                  disabled={loading}
                                >
                                  Marcar como Completada
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() =>
                                    cambiarEstadoCita(cita, 'Cancelada')
                                  }
                                  className="text-danger"
                                  disabled={loading}
                                >
                                  Cancelar Cita
                                </Dropdown.Item>
                              </>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {filteredCitas.length === 0 && !loading && (
                <div className="text-center py-5">
                  <p className="text-muted">No se encontraron citas</p>
                  <Button
                    variant="primary"
                    onClick={handleShowCalendar}
                    disabled={mascotas.length === 0}
                  >
                    Agendar Primera Cita
                  </Button>
                  {mascotas.length === 0 && (
                    <div className="mt-2">
                      <small className="text-warning">
                        Primero debe registrar mascotas
                      </small>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de Calendario */}
      <Modal
        show={showCalendarModal}
        onHide={() => setShowCalendarModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Fecha y Hora</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={8}>
              <h6>
                Semana del {weekDates[0].toLocaleDateString()} al{' '}
                {weekDates[6].toLocaleDateString()}
              </h6>
              <div className="d-flex gap-2 mb-4">
                {weekDates.map((date, index) => (
                  <div
                    key={index}
                    className={`flex-fill text-center p-3 border rounded cursor-pointer ${
                      date.toDateString() === selectedDate.toDateString()
                        ? 'bg-primary text-white'
                        : 'bg-light'
                    }`}
                    onClick={() => handleDateSelect(date)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      {
                        ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][
                          date.getDay()
                        ]
                      }
                    </div>
                    <div className="fw-bold">{date.getDate()}</div>
                  </div>
                ))}
              </div>

              <h6>
                Horarios Disponibles para {selectedDate.toLocaleDateString()}
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant="outline-primary"
                      onClick={() => handleTimeSelect(slot)}
                    >
                      {slot}
                    </Button>
                  ))
                ) : (
                  <p className="text-muted">
                    No hay horarios disponibles para esta fecha
                  </p>
                )}
              </div>
            </Col>
            <Col md={4}>
              <div className="bg-light p-3 rounded">
                <h6>Información:</h6>
                <small>
                  <strong>Horarios de atención:</strong>
                  <br />
                  Lunes a Viernes: 9:00 - 12:00, 14:00 - 17:00
                  <br />
                  Sábado y Domingo: 9:00 - 12:00
                </small>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCalendarModal(false)}
          >
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para completar datos de la cita */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Completar Información de la Cita</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Fecha y Hora Seleccionada</Form.Label>
              <Form.Control
                type="text"
                value={`${formData.fechaCita} ${formData.horaCita}`}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mascota *</Form.Label>
              <Form.Select
                value={formData.mascota_id}
                onChange={(e) =>
                  setFormData({ ...formData, mascota_id: e.target.value })
                }
                required
                disabled={loading}
              >
                <option value="">Seleccionar mascota...</option>
                {mascotas.map((mascota) => (
                  <option key={mascota.id} value={mascota.id}>
                    {mascota.nombre} ({mascota.especie}) -{' '}
                    {getDueñoMascota(mascota.id)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Veterinario *</Form.Label>
              <Form.Select
                value={formData.usuario_id}
                onChange={(e) =>
                  setFormData({ ...formData, usuario_id: e.target.value })
                }
                required
                disabled={loading}
              >
                <option value="">Seleccionar veterinario...</option>
                {veterinarios.map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {vet.nombre} {vet.apellido}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Motivo de la Consulta *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.motivo}
                onChange={(e) =>
                  setFormData({ ...formData, motivo: e.target.value })
                }
                placeholder="Describa el motivo de la consulta..."
                required
                disabled={loading}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Agendando...' : 'Agendar Cita'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CitasList;
