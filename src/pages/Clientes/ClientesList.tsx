import React, { useState, useEffect } from 'react';
import { HiUsers } from 'react-icons/hi2';
import { FcHome } from "react-icons/fc";
import { LiaUserSolid } from "react-icons/lia";
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
  PersonPlus,
  Search,
  ThreeDotsVertical,
  Pencil,
  Trash,
  PersonCheck,
  PersonX,
  Telephone,
  GeoAlt,
  Person,
  Envelope,
} from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import type { Usuario, Mascota } from '../../types';

const ClientesList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [clientes, setClientes] = useState<Usuario[]>([]); // Ahora son Usuarios con rol Cliente
  const [filteredClientes, setFilteredClientes] = useState<Usuario[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Usuario | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Usuario | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:3001';

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    email: '',
    estado: 'Activo' as 'Activo' | 'Inactivo',
  });

  useEffect(() => {
    loadClientes();
    loadMascotas();
  }, []);

  useEffect(() => {
    const filtered = clientes.filter(
      (cliente) =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefono?.includes(searchTerm) ||
        cliente.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.correo &&
          cliente.correo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      if (!response.ok) throw new Error('Error cargando usuarios');

      const usuariosData = await response.json();
      // Filtrar solo usuarios con rol Cliente
      const clientesData = usuariosData.filter(
        (usuario: Usuario) => usuario.rol_nombre === 'Cliente'
      );

      setClientes(clientesData);
      console.log('👥 Clientes (usuarios) cargados:', clientesData);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      // ❌ ELIMINADO: setClientes(mockData.clientes);
      // ✅ REEMPLAZADO POR:
      setClientes([]);
      setAlert({
        type: 'danger',
        message:
          'Error al cargar los clientes. Verifique que JSON Server esté ejecutándose.',
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
        console.warn('No se pudieron cargar las mascotas');
      }
    } catch (error) {
      console.error('Error cargando mascotas:', error);
      // ❌ ELIMINADO: setMascotas(mockData.mascotas);
      // ✅ REEMPLAZADO POR:
      setMascotas([]);
    }
  };

  const getMascotasCount = (usuarioId: number | string) => {
    return mascotas.filter((mascota) => mascota.usuario_id == usuarioId).length;
  };

  const getMascotasNames = (usuarioId: number | string) => {
    const mascotasCliente = mascotas.filter(
      (mascota) => mascota.usuario_id == usuarioId
    );
    return mascotasCliente.map((m) => m.nombre).join(', ');
  };

  const handleShowModal = (cliente?: Usuario) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        email: cliente.correo || '',
        estado: cliente.estado || 'Activo',
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: '',
        email: '',
        estado: 'Activo',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCliente(null);
    setFormData({
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: '',
      email: '',
      estado: 'Activo',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (editingCliente) {
        // NOTA: Ahora todos los clientes son usuarios, así que podemos editarlos
        const response = await fetch(
          `${API_URL}/usuarios/${editingCliente.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...editingCliente,
              nombre: formData.nombre,
              apellido: formData.apellido,
              telefono: formData.telefono || undefined,
              direccion: formData.direccion || undefined,
              correo: formData.email || undefined,
              estado: formData.estado,
            }),
          }
        );

        if (!response.ok) throw new Error('Error actualizando cliente');

        const updatedCliente = await response.json();

        const updatedClientes = clientes.map((cliente) =>
          cliente.id === editingCliente.id ? updatedCliente : cliente
        );
        setClientes(updatedClientes);

        setAlert({
          type: 'success',
          message: 'Cliente actualizado correctamente',
        });
      } else {
        // Crear nuevo cliente (que es un usuario con rol Cliente)
        const newCliente = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono || '',
          direccion: formData.direccion || '',
          correo: formData.email || '',
          rol_nombre: 'Cliente',
          contrasena: 'cliente123', // Contraseña por defecto
          estado: formData.estado,
          fechaRegistro: new Date().toISOString(),
        };

        const response = await fetch(`${API_URL}/usuarios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCliente),
        });

        if (!response.ok) throw new Error('Error creando cliente');

        const createdCliente = await response.json();
        setClientes([...clientes, createdCliente]);
        setAlert({ type: 'success', message: 'Cliente creado correctamente' });
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error guardando cliente:', error);
      setAlert({
        type: 'danger',
        message: 'Error al guardar el cliente',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleDelete = (cliente: Usuario) => {
    // Validar si el cliente tiene mascotas
    const tieneMascotas = getMascotasCount(cliente.id) > 0;

    if (tieneMascotas) {
      setAlert({
        type: 'danger',
        message:
          'No se puede eliminar un cliente que tiene mascotas registradas',
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    // NOTA: Ya no validamos es_usuario porque todos los clientes son usuarios
    setClienteToDelete(cliente);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (clienteToDelete) {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/usuarios/${clienteToDelete.id}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) throw new Error('Error eliminando cliente');

        const updatedClientes = clientes.filter(
          (cliente) => cliente.id !== clienteToDelete.id
        );
        setClientes(updatedClientes);
        setAlert({
          type: 'success',
          message: 'Cliente eliminado correctamente',
        });
        setShowDeleteModal(false);
        setClienteToDelete(null);
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        setAlert({
          type: 'danger',
          message: 'Error al eliminar el cliente',
        });
      } finally {
        setLoading(false);
        setTimeout(() => setAlert(null), 3000);
      }
    }
  };

  const toggleClienteStatus = async (cliente: Usuario) => {
    // Validar si el cliente activo tiene mascotas
    if (cliente.estado === 'Inactivo' && getMascotasCount(cliente.id) > 0) {
      setAlert({
        type: 'danger',
        message: 'No se puede desactivar un cliente que tiene mascotas activas',
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const nuevoEstado = cliente.estado === 'Activo' ? 'Inactivo' : 'Activo';

      const response = await fetch(`${API_URL}/usuarios/${cliente.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: nuevoEstado,
        }),
      });

      if (!response.ok) throw new Error('Error cambiando estado');

      const updatedCliente = await response.json();

      const updatedClientes = clientes.map((c) =>
        c.id === cliente.id ? updatedCliente : c
      );
      setClientes(updatedClientes);

      setAlert({
        type: 'success',
        message: `Cliente ${
          cliente.estado === 'Activo' ? 'desactivado' : 'activado'
        } correctamente`,
      });
    } catch (error) {
      console.error('Error cambiando estado:', error);
      setAlert({
        type: 'danger',
        message: 'Error al cambiar el estado del cliente',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const getEstadoBadge = (estado: Usuario['estado']) => {
    const variants = {
      Activo: 'success',
      Inactivo: 'secondary',
    };
    return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
  };

  const getTipoBadge = (cliente: Usuario) => {
    // Ahora diferenciamos por si tiene email (usuario app) o no (cliente directo)
    const tieneEmail = !!cliente.correo;
    return (
      <Badge bg={tieneEmail ? 'primary' : 'secondary'}>
        {tieneEmail ? (
          <span className="d-inline-flex align-items-center gap-1">
            <LiaUserSolid size={15} />
            Usuario Web
          </span>
        ) : (
          <span className="d-inline-flex align-items-center gap-1">
            <FcHome size={15} />
            Cliente Directo
          </span>
          
        )}
      </Badge>
    );
  };

  const canManage =
    currentUser?.rol_nombre === 'Administrador' ||
    currentUser?.rol_nombre === 'Secretaria';

  if (!canManage) {
    return (
      <Container fluid>
        <Row>
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <div className="text-warning mb-3">
                  <PersonX size={48} />
                </div>
                <h3>Acceso Restringido</h3>
                <p className="text-muted">
                  No tienes permisos para acceder a la gestión de clientes.
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
                  <h3 className="mb-0"><HiUsers size={20} /> Gestión de Clientes</h3>
                  <p className="text-muted mb-0">
                    Administra los clientes del sistema ({clientes.length}{' '}
                    clientes)
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
                      placeholder="Buscar clientes..."
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
                    disabled={loading}
                  >
                    <PersonPlus /> Nuevo Cliente
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-0">
              {loading && clientes.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2 text-muted">Cargando clientes...</p>
                </div>
              ) : (
                <>
                  <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Cliente</th>
                        <th>Contacto</th>
                        <th>Mascotas</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClientes.map((cliente) => {
                        const mascotasCount = getMascotasCount(cliente.id);
                        const mascotasNames = getMascotasNames(cliente.id);

                        return (
                          <tr key={cliente.id}>
                            <td>
                              <div>
                                <strong>
                                  {cliente.nombre} {cliente.apellido}
                                  {getTipoBadge(cliente)}
                                </strong>
                                <br />
                                <small className="text-muted">
                                  ID: {cliente.id}
                                </small>
                              </div>
                            </td>
                            <td>
                              <div>
                                {cliente.correo && (
                                  <div className="d-flex align-items-center gap-1">
                                    <Envelope size={12} />
                                    <small>{cliente.correo}</small>
                                  </div>
                                )}
                                <div className="d-flex align-items-center gap-1">
                                  <Telephone size={12} />
                                  <small>
                                    {cliente.telefono || 'Sin teléfono'}
                                  </small>
                                </div>
                                {cliente.direccion && (
                                  <div className="d-flex align-items-center gap-1 mt-1">
                                    <GeoAlt size={12} />
                                    <small className="text-muted">
                                      {cliente.direccion}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                <Badge
                                  bg={
                                    mascotasCount > 0 ? 'primary' : 'secondary'
                                  }
                                >
                                  {mascotasCount} mascotas
                                </Badge>
                                {mascotasCount > 0 && (
                                  <div className="mt-1">
                                    <small className="text-muted">
                                      {mascotasNames}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>{getEstadoBadge(cliente.estado)}</td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle
                                  variant="light"
                                  size="sm"
                                  id={`dropdown-${cliente.id}`}
                                  disabled={loading}
                                >
                                  <ThreeDotsVertical />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item
                                    onClick={() => handleShowModal(cliente)}
                                    disabled={loading}
                                  >
                                    <Pencil className="me-2" />
                                    Editar
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => toggleClienteStatus(cliente)}
                                    disabled={mascotasCount > 0 || loading}
                                    className={
                                      mascotasCount > 0 ? 'text-muted' : ''
                                    }
                                  >
                                    {cliente.estado === 'Activo' ? (
                                      <>
                                        <PersonX className="me-2" />
                                        Desactivar
                                      </>
                                    ) : (
                                      <>
                                        <PersonCheck className="me-2" />
                                        Activar
                                      </>
                                    )}
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item
                                    onClick={() => handleDelete(cliente)}
                                    disabled={mascotasCount > 0 || loading}
                                    className={
                                      mascotasCount > 0
                                        ? 'text-muted'
                                        : 'text-danger'
                                    }
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

                  {filteredClientes.length === 0 && !loading && (
                    <div className="text-center py-5">
                      <p className="text-muted">No se encontraron clientes</p>
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
            {editingCliente ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Apellido *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
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
                  <Form.Label>Teléfono *</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={loading}
                    placeholder="Opcional para clientes directos"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                disabled={loading}
                placeholder="Dirección opcional"
              />
            </Form.Group>

            {editingCliente && (
              <Form.Group className="mb-3">
                <Form.Label>Estado *</Form.Label>
                <Form.Select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value as 'Activo' | 'Inactivo',
                    })
                  }
                  disabled={loading}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </Form.Select>
              </Form.Group>
            )}

            {!editingCliente && (
              <Alert variant="info">
                <strong>Información:</strong> Al crear un cliente, se creará
                automáticamente como usuario del sistema con rol "Cliente". La
                contraseña por defecto será "cliente123".
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading
                ? 'Guardando...'
                : editingCliente
                ? 'Actualizar Cliente'
                : 'Crear Cliente'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {clienteToDelete && (
            <>
              {getMascotasCount(clienteToDelete.id) > 0 ? (
                <div className="text-center text-warning">
                  <PersonX size={48} className="mb-3" />
                  <h5>No se puede eliminar cliente con mascotas</h5>
                  <p className="text-muted">
                    Este cliente tiene mascotas registradas. Primero debe
                    transferir o eliminar las mascotas.
                  </p>
                </div>
              ) : (
                <>
                  ¿Estás seguro de que deseas eliminar al cliente{' '}
                  <strong>
                    {clienteToDelete.nombre} {clienteToDelete.apellido}
                  </strong>
                  ?
                  <br />
                  <small className="text-muted">
                    Esta acción no se puede deshacer.
                  </small>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={loading}
          >
            {clienteToDelete && getMascotasCount(clienteToDelete.id) > 0
              ? 'Entendido'
              : 'Cancelar'}
          </Button>
          {clienteToDelete && getMascotasCount(clienteToDelete.id) === 0 && (
            <Button variant="danger" onClick={confirmDelete} disabled={loading}>
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ClientesList;
