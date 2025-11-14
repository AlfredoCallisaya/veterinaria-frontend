import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
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
  Pencil,
  Trash,
  Eye,
  FileMedical,
  Calendar,
  Person,
} from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import { Tratamiento as TratamientoType, Mascota, Usuario } from '../../types';

interface Tratamiento {
  id: number | string;
  mascota_id: number | string;
  veterinario_id: number | string;
  nombre: string;
  descripcion: string;
  tipo:
    | 'Medicamento'
    | 'Terapia'
    | 'Cirugía'
    | 'Vacunación'
    | 'Control'
    | 'Otro';
  fecha_inicio: string;
  fecha_fin: string;
  dosis?: string;
  frecuencia?: string;
  costo: number;
  estado: 'Activo' | 'Completado' | 'Cancelado' | 'Pendiente';
  observaciones?: string;
}

const TreatmentsList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [veterinarios, setVeterinarios] = useState<Usuario[]>([]);
  const [filteredTratamientos, setFilteredTratamientos] = useState<
    Tratamiento[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingTratamiento, setEditingTratamiento] =
    useState<Tratamiento | null>(null);
  const [selectedTratamiento, setSelectedTratamiento] =
    useState<Tratamiento | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:3001';

  const [formData, setFormData] = useState({
    mascota_id: '',
    veterinario_id: '',
    nombre: '',
    descripcion: '',
    tipo: 'Medicamento' as
      | 'Medicamento'
      | 'Terapia'
      | 'Cirugía'
      | 'Vacunación'
      | 'Control'
      | 'Otro',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    dosis: '',
    frecuencia: '',
    costo: 0,
    estado: 'Activo' as 'Activo' | 'Completado' | 'Cancelado' | 'Pendiente',
    observaciones: '',
  });

  const tiposTratamiento = [
    'Medicamento',
    'Terapia',
    'Cirugía',
    'Vacunación',
    'Control',
    'Otro',
  ];

  const estadosTratamiento = ['Activo', 'Completado', 'Cancelado', 'Pendiente'];

  const frecuencias = [
    'Una vez al día',
    'Cada 12 horas',
    'Cada 8 horas',
    'Cada 6 horas',
    'Una vez por semana',
    'Cada 15 días',
    'Una vez al mes',
    'Según necesidad',
  ];

  useEffect(() => {
    loadTratamientos();
    loadMascotas();
    loadVeterinarios();
  }, []);

  useEffect(() => {
    const filtered = tratamientos.filter(
      (tratamiento) =>
        tratamiento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tratamiento.descripcion
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getMascotaNombre(tratamiento.mascota_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        tratamiento.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTratamientos(filtered);
  }, [searchTerm, tratamientos]);

  const loadTratamientos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tratamientos`);
      if (response.ok) {
        const tratamientosData = await response.json();
        setTratamientos(tratamientosData);
      } else {
        throw new Error('Error cargando tratamientos');
      }
    } catch (error) {
      console.error('Error cargando tratamientos:', error);
      setAlert({ type: 'danger', message: 'Error al cargar los tratamientos' });
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

    // En una implementación real, buscarías el cliente dueño de la mascota
    return 'Cliente no disponible';
  };

  const getTipoBadge = (tipo: string) => {
    const variants: { [key: string]: string } = {
      Medicamento: 'primary',
      Terapia: 'info',
      Cirugía: 'danger',
      Vacunación: 'success',
      Control: 'warning',
      Otro: 'secondary',
    };
    return <Badge bg={variants[tipo] || 'secondary'}>{tipo}</Badge>;
  };

  const getEstadoBadge = (estado: string) => {
    const variants: { [key: string]: string } = {
      Activo: 'success',
      Completado: 'primary',
      Cancelado: 'danger',
      Pendiente: 'warning',
    };
    return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
  };

  const handleShowModal = (tratamiento?: Tratamiento) => {
    if (tratamiento) {
      setEditingTratamiento(tratamiento);
      setFormData({
        mascota_id: tratamiento.mascota_id.toString(),
        veterinario_id: tratamiento.veterinario_id.toString(),
        nombre: tratamiento.nombre,
        descripcion: tratamiento.descripcion,
        tipo: tratamiento.tipo,
        fecha_inicio: tratamiento.fecha_inicio,
        fecha_fin: tratamiento.fecha_fin,
        dosis: tratamiento.dosis || '',
        frecuencia: tratamiento.frecuencia || '',
        costo: tratamiento.costo,
        estado: tratamiento.estado,
        observaciones: tratamiento.observaciones || '',
      });
    } else {
      setEditingTratamiento(null);
      setFormData({
        mascota_id: '',
        veterinario_id: '',
        nombre: '',
        descripcion: '',
        tipo: 'Medicamento',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        dosis: '',
        frecuencia: '',
        costo: 0,
        estado: 'Activo',
        observaciones: '',
      });
    }
    setShowModal(true);
  };

  const handleShowDetailModal = (tratamiento: Tratamiento) => {
    setSelectedTratamiento(tratamiento);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTratamiento) {
        const response = await fetch(
          `${API_URL}/tratamientos/${editingTratamiento.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...editingTratamiento,
              mascota_id: formData.mascota_id,
              veterinario_id: formData.veterinario_id,
              nombre: formData.nombre,
              descripcion: formData.descripcion,
              tipo: formData.tipo,
              fecha_inicio: formData.fecha_inicio,
              fecha_fin: formData.fecha_fin,
              dosis: formData.dosis || undefined,
              frecuencia: formData.frecuencia || undefined,
              costo: Number(formData.costo),
              estado: formData.estado,
              observaciones: formData.observaciones || undefined,
            }),
          }
        );

        if (!response.ok) throw new Error('Error actualizando tratamiento');

        const updatedTratamiento = await response.json();
        const updatedTratamientos = tratamientos.map((t) =>
          t.id === editingTratamiento.id ? updatedTratamiento : t
        );
        setTratamientos(updatedTratamientos);
        setAlert({
          type: 'success',
          message: 'Tratamiento actualizado correctamente',
        });
      } else {
        const nuevoTratamiento = {
          mascota_id: formData.mascota_id,
          veterinario_id: formData.veterinario_id,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          tipo: formData.tipo,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          dosis: formData.dosis || undefined,
          frecuencia: formData.frecuencia || undefined,
          costo: Number(formData.costo),
          estado: formData.estado,
          observaciones: formData.observaciones || undefined,
        };

        const response = await fetch(`${API_URL}/tratamientos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoTratamiento),
        });

        if (!response.ok) throw new Error('Error creando tratamiento');

        const createdTratamiento = await response.json();
        setTratamientos([...tratamientos, createdTratamiento]);
        setAlert({
          type: 'success',
          message: 'Tratamiento creado correctamente',
        });
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error guardando tratamiento:', error);
      setAlert({ type: 'danger', message: 'Error al guardar el tratamiento' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleDelete = async (tratamiento: Tratamiento) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar el tratamiento "${tratamiento.nombre}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/tratamientos/${tratamiento.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Error eliminando tratamiento');

      const updatedTratamientos = tratamientos.filter(
        (t) => t.id !== tratamiento.id
      );
      setTratamientos(updatedTratamientos);
      setAlert({
        type: 'success',
        message: 'Tratamiento eliminado correctamente',
      });
    } catch (error) {
      console.error('Error eliminando tratamiento:', error);
      setAlert({ type: 'danger', message: 'Error al eliminar el tratamiento' });
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
                  No tienes permisos para acceder a la gestión de tratamientos.
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
                  <h3 className="mb-0">💊 Gestión de Tratamientos</h3>
                  <p className="text-muted mb-0">
                    Administración de tratamientos médicos (
                    {tratamientos.length} tratamientos)
                  </p>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar tratamientos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={2} className="text-end">
                  <Button variant="primary" onClick={() => handleShowModal()}>
                    <PlusCircle className="me-2" />
                    Nuevo Tratamiento
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Estadísticas */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-primary text-white">
                <Card.Body className="text-center">
                  <h4>
                    {tratamientos.filter((t) => t.estado === 'Activo').length}
                  </h4>
                  <small>Tratamientos Activos</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-success text-white">
                <Card.Body className="text-center">
                  <h4>
                    {
                      tratamientos.filter((t) => t.estado === 'Completado')
                        .length
                    }
                  </h4>
                  <small>Completados</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-warning text-dark">
                <Card.Body className="text-center">
                  <h4>
                    {
                      tratamientos.filter((t) => t.estado === 'Pendiente')
                        .length
                    }
                  </h4>
                  <small>Pendientes</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-danger text-white">
                <Card.Body className="text-center">
                  <h4>
                    $
                    {tratamientos
                      .reduce((sum, t) => sum + t.costo, 0)
                      .toFixed(2)}
                  </h4>
                  <small>Total en Tratamientos</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabla de Tratamientos */}
          <Card>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Tratamiento</th>
                    <th>Mascota</th>
                    <th>Tipo</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Estado</th>
                    <th>Costo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTratamientos.map((tratamiento) => (
                    <tr key={tratamiento.id}>
                      <td>
                        <div>
                          <strong>{tratamiento.nombre}</strong>
                          <br />
                          <small className="text-muted">
                            {tratamiento.descripcion.length > 50
                              ? `${tratamiento.descripcion.substring(0, 50)}...`
                              : tratamiento.descripcion}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>
                            {getMascotaNombre(tratamiento.mascota_id)}
                          </strong>
                          <br />
                          <small className="text-muted">
                            {getClienteNombre(tratamiento.mascota_id)}
                          </small>
                        </div>
                      </td>
                      <td>{getTipoBadge(tratamiento.tipo)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Calendar size={14} />
                          {new Date(
                            tratamiento.fecha_inicio
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        {tratamiento.fecha_fin ? (
                          <div className="d-flex align-items-center gap-2">
                            <Calendar size={14} />
                            {new Date(
                              tratamiento.fecha_fin
                            ).toLocaleDateString()}
                          </div>
                        ) : (
                          <Badge bg="secondary">No definida</Badge>
                        )}
                      </td>
                      <td>{getEstadoBadge(tratamiento.estado)}</td>
                      <td>
                        <Badge bg="outline-success">
                          ${tratamiento.costo.toFixed(2)}
                        </Badge>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm">
                            <ThreeDotsVertical />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => handleShowDetailModal(tratamiento)}
                            >
                              <Eye className="me-2" />
                              Ver Detalles
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleShowModal(tratamiento)}
                            >
                              <Pencil className="me-2" />
                              Editar
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              onClick={() => handleDelete(tratamiento)}
                              className="text-danger"
                            >
                              <Trash className="me-2" />
                              Eliminar
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {filteredTratamientos.length === 0 && !loading && (
                <div className="text-center py-5">
                  <p className="text-muted">No se encontraron tratamientos</p>
                  <Button variant="primary" onClick={() => handleShowModal()}>
                    Crear Primer Tratamiento
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para crear/editar tratamiento */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTratamiento ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
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
                  >
                    <option value="">Seleccionar mascota...</option>
                    {mascotas.map((mascota) => (
                      <option key={mascota.id} value={mascota.id}>
                        {mascota.nombre} ({mascota.especie})
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
                  <Form.Label>Nombre del Tratamiento *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                    placeholder="Ej: Antibiótico, Quimioterapia, etc."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo *</Form.Label>
                  <Form.Select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipo: e.target.value as
                          | 'Medicamento'
                          | 'Terapia'
                          | 'Cirugía'
                          | 'Vacunación'
                          | 'Control'
                          | 'Otro',
                      })
                    }
                    required
                  >
                    {tiposTratamiento.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descripción *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                required
                placeholder="Descripción detallada del tratamiento..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Inicio *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha_inicio: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha_fin: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dosis</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.dosis}
                    onChange={(e) =>
                      setFormData({ ...formData, dosis: e.target.value })
                    }
                    placeholder="Ej: 50mg, 1 tableta, etc."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Frecuencia</Form.Label>
                  <Form.Select
                    value={formData.frecuencia}
                    onChange={(e) =>
                      setFormData({ ...formData, frecuencia: e.target.value })
                    }
                  >
                    <option value="">Seleccionar frecuencia...</option>
                    {frecuencias.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Costo ($) *</Form.Label>
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
                          | 'Activo'
                          | 'Completado'
                          | 'Cancelado'
                          | 'Pendiente',
                      })
                    }
                    required
                  >
                    {estadosTratamiento.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.observaciones}
                onChange={(e) =>
                  setFormData({ ...formData, observaciones: e.target.value })
                }
                placeholder="Observaciones adicionales..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading
                ? 'Guardando...'
                : editingTratamiento
                ? 'Actualizar'
                : 'Crear'}{' '}
              Tratamiento
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de detalles */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalles del Tratamiento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTratamiento && (
            <Row>
              <Col md={6}>
                <h6>Información General</h6>
                <Table size="sm" borderless>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Nombre:</strong>
                      </td>
                      <td>{selectedTratamiento.nombre}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Mascota:</strong>
                      </td>
                      <td>
                        {getMascotaNombre(selectedTratamiento.mascota_id)}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Veterinario:</strong>
                      </td>
                      <td>
                        {getVeterinarioNombre(
                          selectedTratamiento.veterinario_id
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Tipo:</strong>
                      </td>
                      <td>{getTipoBadge(selectedTratamiento.tipo)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Estado:</strong>
                      </td>
                      <td>{getEstadoBadge(selectedTratamiento.estado)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h6>Detalles del Tratamiento</h6>
                <Table size="sm" borderless>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Fecha Inicio:</strong>
                      </td>
                      <td>
                        {new Date(
                          selectedTratamiento.fecha_inicio
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Fecha Fin:</strong>
                      </td>
                      <td>
                        {selectedTratamiento.fecha_fin
                          ? new Date(
                              selectedTratamiento.fecha_fin
                            ).toLocaleDateString()
                          : 'No definida'}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Costo:</strong>
                      </td>
                      <td>${selectedTratamiento.costo.toFixed(2)}</td>
                    </tr>
                    {selectedTratamiento.dosis && (
                      <tr>
                        <td>
                          <strong>Dosis:</strong>
                        </td>
                        <td>{selectedTratamiento.dosis}</td>
                      </tr>
                    )}
                    {selectedTratamiento.frecuencia && (
                      <tr>
                        <td>
                          <strong>Frecuencia:</strong>
                        </td>
                        <td>{selectedTratamiento.frecuencia}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>

              <Col md={12} className="mt-3">
                <h6>Descripción</h6>
                <Card>
                  <Card.Body>
                    <p>{selectedTratamiento.descripcion}</p>
                  </Card.Body>
                </Card>
              </Col>

              {selectedTratamiento.observaciones && (
                <Col md={12} className="mt-3">
                  <h6>Observaciones</h6>
                  <Card>
                    <Card.Body>
                      <p>{selectedTratamiento.observaciones}</p>
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

export default TreatmentsList;
