import React, { useState, useEffect } from 'react';
import { MdPets } from 'react-icons/md';
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
  Person,
  GenderMale,
  GenderFemale,
} from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import type { Mascota, Usuario } from '../../types';

const MascotasList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredMascotas, setFilteredMascotas] = useState<Mascota[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMascota, setEditingMascota] = useState<Mascota | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mascotaToDelete, setMascotaToDelete] = useState<Mascota | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:3001';

  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    edad: 1,
    sexo: 'M' as 'M' | 'H',
    usuario_id: '',
  });

  const especies = [
    'Perro',
    'Gato',
    'Pájaro',
    'Conejo',
    'Hámster',
    'Tortuga',
    'Pez',
    'Serpiente',
    'Iguana',
    'Otro',
  ];

  useEffect(() => {
    loadMascotas();
    loadUsuarios();
  }, []);

  useEffect(() => {
    const filtered = mascotas.filter(
      (mascota) =>
        mascota.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mascota.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mascota.raza.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClienteNombre(mascota.usuario_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredMascotas(filtered);
  }, [searchTerm, mascotas, usuarios]);

  const loadMascotas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/mascotas`);
      if (!response.ok) throw new Error('Error cargando mascotas');
      const mascotasData = await response.json();
      setMascotas(mascotasData);
      console.log('Mascotas cargadas desde JSON Server:', mascotasData);
    } catch (error) {
      console.error('Error cargando mascotas:', error);
      setAlert({
        type: 'danger',
        message: 'Error al cargar las mascotas',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      if (!response.ok) throw new Error('Error cargando usuarios');

      const usuariosData = await response.json();
      console.log('Usuarios cargados:', usuariosData);

      const clientes = usuariosData.filter(
        (usuario: Usuario) => usuario.rol_nombre === 'Cliente'
      );

      setUsuarios(clientes);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setAlert({
        type: 'danger',
        message: 'Error al cargar los clientes',
      });
    }
  };

  const getClienteNombre = (usuarioId: string | number) => {
    const cliente = usuarios.find((u) => u.id == usuarioId);
    return cliente
      ? `${cliente.nombre} ${cliente.apellido}`
      : 'Cliente no encontrado';
  };

  const getClienteInfo = (usuarioId: string | number) => {
    return usuarios.find((u) => u.id == usuarioId) || null;
  };

  const getSexoBadge = (sexo: string) => {
    return sexo === 'M' ? (
      <Badge bg="info">
        <GenderMale className="me-1" />
        Macho
      </Badge>
    ) : (
      <Badge bg="warning">
        <GenderFemale className="me-1" />
        Hembra
      </Badge>
    );
  };

  const getEstadoBadge = (estado: Mascota['estado']) => {
    const variants = {
      Activo: 'success',
      Inactivo: 'secondary',
    };
    return <Badge bg={variants[estado]}>{estado}</Badge>;
  };

  const handleShowModal = (mascota?: Mascota) => {
    if (mascota) {
      setEditingMascota(mascota);
      setFormData({
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza,
        edad: mascota.edad,
        sexo: mascota.sexo,
        usuario_id: mascota.usuario_id.toString(),
      });
    } else {
      setEditingMascota(null);
      setFormData({
        nombre: '',
        especie: 'Perro',
        raza: '',
        edad: 1,
        sexo: 'M',
        usuario_id: usuarios.length > 0 ? usuarios[0].id.toString() : '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMascota(null);
    setFormData({
      nombre: '',
      especie: 'Perro',
      raza: '',
      edad: 1,
      sexo: 'M',
      usuario_id: usuarios.length > 0 ? usuarios[0].id.toString() : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.usuario_id) {
      setAlert({
        type: 'danger',
        message: 'Debe seleccionar un cliente',
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setLoading(true);

    try {
      if (editingMascota) {
        const response = await fetch(
          `${API_URL}/mascotas/${editingMascota.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...editingMascota,
              nombre: formData.nombre,
              especie: formData.especie,
              raza: formData.raza,
              edad: formData.edad,
              sexo: formData.sexo,
              usuario_id: formData.usuario_id,
            }),
          }
        );

        if (!response.ok) throw new Error('Error actualizando mascota');

        const updatedMascota = await response.json();

        const updatedMascotas = mascotas.map((mascota) =>
          mascota.id === editingMascota.id ? updatedMascota : mascota
        );
        setMascotas(updatedMascotas);

        setAlert({
          type: 'success',
          message: 'Mascota actualizada correctamente',
        });
      } else {
        const newMascota = {
          nombre: formData.nombre,
          especie: formData.especie,
          raza: formData.raza,
          edad: formData.edad,
          sexo: formData.sexo,
          usuario_id: formData.usuario_id,
          estado: 'Activo',
          fecha_registro: new Date().toISOString().split('T')[0],
        };

        const response = await fetch(`${API_URL}/mascotas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMascota),
        });

        if (!response.ok) throw new Error('Error creando mascota');

        const createdMascota = await response.json();
        setMascotas([...mascotas, createdMascota]);
        setAlert({ type: 'success', message: 'Mascota creada correctamente' });
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error guardando mascota:', error);
      setAlert({
        type: 'danger',
        message: 'Error al guardar la mascota',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleDelete = (mascota: Mascota) => {
    setMascotaToDelete(mascota);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (mascotaToDelete) {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/mascotas/${mascotaToDelete.id}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) throw new Error('Error eliminando mascota');

        const updatedMascotas = mascotas.filter(
          (mascota) => mascota.id !== mascotaToDelete.id
        );
        setMascotas(updatedMascotas);
        setAlert({
          type: 'success',
          message: 'Mascota eliminada correctamente',
        });
        setShowDeleteModal(false);
        setMascotaToDelete(null);
      } catch (error) {
        console.error('Error eliminando mascota:', error);
        setAlert({
          type: 'danger',
          message: 'Error al eliminar la mascota',
        });
      } finally {
        setLoading(false);
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  const toggleMascotaStatus = async (mascota: Mascota) => {
    setLoading(true);
    try {
      const nuevoEstado = mascota.estado === 'Activo' ? 'Inactivo' : 'Activo';

      const response = await fetch(`${API_URL}/mascotas/${mascota.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: nuevoEstado,
        }),
      });

      if (!response.ok) throw new Error('Error cambiando estado');

      const updatedMascota = await response.json();

      const updatedMascotas = mascotas.map((m) =>
        m.id === mascota.id ? updatedMascota : m
      );
      setMascotas(updatedMascotas);

      setAlert({
        type: 'success',
        message: `Mascota ${
          mascota.estado === 'Activo' ? 'desactivada' : 'activada'
        } correctamente`,
      });
    } catch (error) {
      console.error('Error cambiando estado:', error);
      setAlert({
        type: 'danger',
        message: 'Error al cambiar el estado de la mascota',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

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
                  <Person size={48} />
                </div>
                <h3>Acceso Restringido</h3>
                <p className="text-muted">
                  No tienes permisos para acceder a la gestión de mascotas.
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
          {alert && (
            <Alert variant={alert.type} className="mb-3">
              {alert.message}
            </Alert>
          )}

          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6}>
                  <h3 className="mb-0">
                    <MdPets className="m-2" />
                    Gestión de Mascotas
                  </h3>
                  <p className="text-muted mb-0">
                    Administra las mascotas del sistema ({mascotas.length}{' '}
                    mascotas)
                    {loading && (
                      <Badge bg="warning" className="ms-2">
                        Cargando...
                      </Badge>
                    )}
                  </p>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar mascotas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={loading}
                    />
                  </InputGroup>
                </Col>
                <Col md={2} className="text-end">
                  <Button
                    variant="primary"
                    onClick={() => handleShowModal()}
                    className="d-flex align-items-center gap-2"
                    disabled={loading || usuarios.length === 0}
                  >
                    <PlusCircle /> Nueva Mascota
                  </Button>
                </Col>
              </Row>
              {usuarios.length === 0 && (
                <Alert variant="warning" className="mt-2 mb-0">
                  <small>
                    No hay clientes registrados. Debe crear clientes primero
                    para agregar mascotas.
                  </small>
                </Alert>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-0">
              {loading && mascotas.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2 text-muted">Cargando mascotas...</p>
                </div>
              ) : (
                <>
                  <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Mascota</th>
                        <th>Especie/Raza</th>
                        <th>Edad</th>
                        <th>Sexo</th>
                        <th>Dueño</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMascotas.map((mascota) => {
                        const cliente = getClienteInfo(mascota.usuario_id);
                        return (
                          <tr key={mascota.id}>
                            <td>
                              <div>
                                <strong>{mascota.nombre}</strong>
                                <br />
                                <small className="text-muted">
                                  ID: {mascota.id}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <Badge bg="primary" className="me-1">
                                  {mascota.especie}
                                </Badge>
                                <div className="mt-1">
                                  <small className="text-muted">
                                    {mascota.raza}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <strong>{mascota.edad}</strong> año
                              {mascota.edad !== 1 ? 's' : ''}
                            </td>
                            <td>{getSexoBadge(mascota.sexo)}</td>
                            <td>
                              <div className="d-flex align-items-center gap-1">
                                <Person size={12} />
                                <small>
                                  {getClienteNombre(mascota.usuario_id)}
                                </small>
                              </div>
                            </td>
                            <td>{getEstadoBadge(mascota.estado)}</td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle
                                  variant="light"
                                  size="sm"
                                  id={`dropdown-${mascota.id}`}
                                  disabled={loading}
                                >
                                  <ThreeDotsVertical />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item
                                    onClick={() => handleShowModal(mascota)}
                                    disabled={loading}
                                  >
                                    <Pencil className="me-2" />
                                    Editar
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => toggleMascotaStatus(mascota)}
                                    disabled={loading}
                                  >
                                    {mascota.estado === 'Activo' ? (
                                      <>
                                        <Trash className="me-2" />
                                        Desactivar
                                      </>
                                    ) : (
                                      <>
                                        <PlusCircle className="me-2" />
                                        Activar
                                      </>
                                    )}
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item
                                    onClick={() => handleDelete(mascota)}
                                    disabled={loading}
                                    className="text-danger"
                                  >
                                    <Trash className="me-2" />
                                    Eliminar
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>

                  {filteredMascotas.length === 0 && !loading && (
                    <div className="text-center py-5">
                      <p className="text-muted">No se encontraron mascotas</p>
                      {usuarios.length === 0 ? (
                        <Button
                          variant="outline-primary"
                          onClick={() => (window.location.href = '/usuarios')}
                        >
                          Ir a Gestión de Usuarios
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => handleShowModal()}
                        >
                          Agregar Primera Mascota
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingMascota ? 'Editar Mascota' : 'Registrar Nueva Mascota'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la Mascota *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                    disabled={loading}
                    placeholder="Ej: Luna, Max, etc."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Especie *</Form.Label>
                  <Form.Select
                    value={formData.especie}
                    onChange={(e) =>
                      setFormData({ ...formData, especie: e.target.value })
                    }
                    required
                    disabled={loading}
                  >
                    {especies.map((especie) => (
                      <option key={especie} value={especie}>
                        {especie}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Raza *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.raza}
                    onChange={(e) =>
                      setFormData({ ...formData, raza: e.target.value })
                    }
                    required
                    disabled={loading}
                    placeholder="Ej: Labrador, Siamés, etc."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Edad (años) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="50"
                    value={formData.edad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        edad: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sexo *</Form.Label>
                  <Form.Select
                    value={formData.sexo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sexo: e.target.value as 'M' | 'H',
                      })
                    }
                    required
                    disabled={loading}
                  >
                    <option value="M">Macho</option>
                    <option value="H">Hembra</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Dueño *</Form.Label>
                  <Form.Select
                    value={formData.usuario_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usuario_id: e.target.value,
                      })
                    }
                    required
                    disabled={loading || usuarios.length === 0}
                  >
                    <option value="">Seleccionar cliente...</option>
                    {usuarios
                      .filter((usuario) => usuario.estado === 'Activo')
                      .map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nombre} {usuario.apellido} -{' '}
                          {usuario.telefono}
                        </option>
                      ))}
                  </Form.Select>
                  {usuarios.length === 0 && (
                    <Form.Text className="text-danger">
                      No hay clientes registrados. Debe crear clientes primero.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={
                loading || usuarios.length === 0 || !formData.usuario_id
              }
            >
              {loading
                ? 'Guardando...'
                : editingMascota
                ? 'Actualizar Mascota'
                : 'Registrar Mascota'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mascotaToDelete && (
            <>
              ¿Estás seguro de que deseas eliminar a la mascota{' '}
              <strong>{mascotaToDelete.nombre}</strong>?
              <br />
              <small className="text-muted">
                Esta acción no se puede deshacer.
              </small>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MascotasList;
