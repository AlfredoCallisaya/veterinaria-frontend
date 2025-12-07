import React, { useState, useEffect } from 'react';
import { HiUsers } from 'react-icons/hi2';
import { FcHome } from "react-icons/fc";
import { LiaUserSolid } from "react-icons/lia";
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert, InputGroup, Dropdown } from 'react-bootstrap';
import { PersonPlus, Search, ThreeDotsVertical, Pencil, Trash, PersonCheck, PersonX, Telephone, GeoAlt, Envelope } from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import { clienteService, type CreateClienteData, type ClienteConMascotas } from '../../services/clienteService';
import type { Usuario } from '../../types';

const ClientesList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [clientes, setClientes] = useState<ClienteConMascotas[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteConMascotas[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<ClienteConMascotas | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<ClienteConMascotas | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateClienteData>({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    email: '',
    estado: 'Activo',
  });

  // Cargar clientes
  useEffect(() => {
    loadClientes();
  }, []);

  // Filtrar clientes (solo UI)
  useEffect(() => {
    const filtered = clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono?.includes(searchTerm) ||
      cliente.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cliente.correo && cliente.correo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const clientesData = await clienteService.getAllClientes();
      setClientes(clientesData);
    } catch (error) {
      showError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const showError = (message: string) => {
    setAlert({ type: 'danger', message });
    setTimeout(() => setAlert(null), 3000);
  };

  const showSuccess = (message: string) => {
    setAlert({ type: 'success', message });
    setTimeout(() => setAlert(null), 3000);
  };

  // Handlers de UI
  const handleShowModal = (cliente?: ClienteConMascotas) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCliente) {
        await clienteService.updateCliente({
          id: editingCliente.id,
          ...formData
        });
        showSuccess('Cliente actualizado correctamente');
      } else {
        await clienteService.createCliente(formData);
        showSuccess('Cliente creado correctamente');
      }
      
      await loadClientes();
      handleCloseModal();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cliente: ClienteConMascotas) => {
    try {
      const validacion = await clienteService.validarEliminacion(cliente.id);
      
      if (!validacion.puede_eliminar) {
        showError(validacion.razon || 'No se puede eliminar el cliente');
        return;
      }
      
      setClienteToDelete(cliente);
      setShowDeleteModal(true);
    } catch (error) {
      showError('Error al validar eliminación');
    }
  };

  const confirmDelete = async () => {
    if (!clienteToDelete) return;

    setLoading(true);
    try {
      await clienteService.deleteCliente(clienteToDelete.id);
      await loadClientes();
      showSuccess('Cliente eliminado correctamente');
      setShowDeleteModal(false);
      setClienteToDelete(null);
    } catch (error) {
      showError('Error al eliminar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const toggleClienteStatus = async (cliente: ClienteConMascotas) => {
    try {
      const nuevoEstado = cliente.estado === 'Activo' ? 'Inactivo' : 'Activo';
      
      // Validar con el backend
      if (nuevoEstado === 'Inactivo') {
        const validacion = await clienteService.validarDesactivacion(cliente.id);
        if (!validacion.puede_desactivar) {
          showError(validacion.razon || 'No se puede desactivar el cliente');
          return;
        }
      }

      setLoading(true);
      await clienteService.toggleClienteStatus(cliente.id, nuevoEstado);
      await loadClientes();
      showSuccess(`Cliente ${cliente.estado === 'Activo' ? 'desactivado' : 'activado'} correctamente`);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  // Helpers de UI
  const getEstadoBadge = (estado: string) => {
    const variants = { Activo: 'success', Inactivo: 'secondary' };
    return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
  };

  const getTipoBadge = (cliente: ClienteConMascotas) => {
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

  const canManage = currentUser?.rol_nombre === 'Administrador' || currentUser?.rol_nombre === 'Secretaria';

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
                <p className="text-muted">No tienes permisos para acceder a la gestión de clientes.</p>
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
          {alert && <Alert variant={alert.type} className="mb-3">{alert.message}</Alert>}

          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6}>
                  <h3 className="mb-0"><HiUsers size={20} /> Gestión de Clientes</h3>
                  <p className="text-muted mb-0">
                    Administra los clientes del sistema ({clientes.length} clientes)
                    {loading && <Badge bg="warning" className="ms-2">Cargando...</Badge>}
                  </p>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text><Search /></InputGroup.Text>
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
                      {filteredClientes.map((cliente) => (
                        <tr key={cliente.id}>
                          <td>
                            <div>
                              <strong>
                                {cliente.nombre} {cliente.apellido}
                                {getTipoBadge(cliente)}
                              </strong>
                              <br />
                              <small className="text-muted">ID: {cliente.id}</small>
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
                                <small>{cliente.telefono || 'Sin teléfono'}</small>
                              </div>
                              {cliente.direccion && (
                                <div className="d-flex align-items-center gap-1 mt-1">
                                  <GeoAlt size={12} />
                                  <small className="text-muted">{cliente.direccion}</small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              <Badge bg={cliente.mascotas_count > 0 ? 'primary' : 'secondary'}>
                                {cliente.mascotas_count} mascotas
                              </Badge>
                              {cliente.mascotas_count > 0 && (
                                <div className="mt-1">
                                  <small className="text-muted">
                                    {cliente.mascotas_names.join(', ')}
                                  </small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{getEstadoBadge(cliente.estado)}</td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle variant="light" size="sm" disabled={loading}>
                                <ThreeDotsVertical />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleShowModal(cliente)} disabled={loading}>
                                  <Pencil className="me-2" /> Editar
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => toggleClienteStatus(cliente)} disabled={loading}>
                                  {cliente.estado === 'Activo' ? (
                                    <><PersonX className="me-2" /> Desactivar</>
                                  ) : (
                                    <><PersonCheck className="me-2" /> Activar</>
                                  )}
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => handleDelete(cliente)} disabled={loading} className="text-danger">
                                  <Trash className="me-2" /> Eliminar
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
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

      {/* Modal para crear/editar cliente */}
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
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                disabled={loading}
                placeholder="Dirección opcional"
              />
            </Form.Group>

            {editingCliente && (
              <Form.Group className="mb-3">
                <Form.Label>Estado *</Form.Label>
                <Form.Select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'Activo' | 'Inactivo' })}
                  disabled={loading}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </Form.Select>
              </Form.Group>
            )}

            {!editingCliente && (
              <Alert variant="info">
                <strong>Información:</strong> Al crear un cliente, se creará automáticamente como usuario del sistema con rol "Cliente".
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : editingCliente ? 'Actualizar Cliente' : 'Crear Cliente'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {clienteToDelete && (
            <>
              ¿Estás seguro de que deseas eliminar al cliente{' '}
              <strong>{clienteToDelete.nombre} {clienteToDelete.apellido}</strong>?
              <br />
              <small className="text-muted">Esta acción no se puede deshacer.</small>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading}>
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

export default ClientesList;