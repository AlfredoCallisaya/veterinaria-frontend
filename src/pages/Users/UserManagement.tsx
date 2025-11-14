import React, { useState, useEffect } from 'react';
import { HiUsers } from 'react-icons/hi2';
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
} from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import type { Usuario } from '../../types';

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api"

  const roles = [
    {
      id: 1,
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
    },
    {
      id: 2,
      nombre: 'Veterinario',
      descripcion: 'Atención médica y consultas',
    },
    {
      id: 3,
      nombre: 'Secretaria',
      descripcion: 'Gestión de citas y recepción',
    },
    {
      id: 4,
      nombre: 'Cliente',
      descripcion: 'Dueño de mascota (acceso limitado)',
    },
  ];

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: '',
    rol_nombre: 'Secretaria',
    contrasena: '',
    estado: 'Activo' as 'Activo' | 'Inactivo',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.rol_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios/`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`
        }
      });

      if (!response.ok) throw new Error("Error cargando usuarios");

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShowModal = (user?: Usuario) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        rol_nombre: user.rol_nombre,
        contrasena: user.contrasena,
        estado: user.estado || 'Activo',
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        direccion: '',
        rol_nombre: 'Secretaria',
        contrasena: '',
        estado: 'Activo',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      direccion: '',
      rol_nombre: 'Secretaria',
      contrasena: '',
      estado: 'Activo',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rol_nombre === 'Cliente') {
      // Para clientes: solo requerir nombre, apellido y teléfono
      if (!formData.nombre || !formData.apellido || !formData.telefono) {
        setAlert({
          type: 'danger',
          message: 'Para clientes: nombre, apellido y teléfono son requeridos',
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }
      // Email opcional para clientes - si está vacío, lo seteamos como string vacío
      if (!formData.correo) {
        formData.correo = '';
      }
    } else {
      // Para otros roles: validación normal
      if (!formData.nombre || !formData.apellido || !formData.correo) {
        setAlert({
          type: 'danger',
          message: 'Nombre, apellido y correo son requeridos',
        });
        setTimeout(() => setAlert(null), 3000);
        return;
      }
    }

    // Validar contraseña
    if (formData.contrasena.length < 6) {
      setAlert({
        type: 'danger',
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setLoading(true);

    try {
      if (editingUser) {
        // Editar usuario existente
        const response = await fetch(`${API_URL}/usuarios/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...editingUser,
            nombre: formData.nombre,
            apellido: formData.apellido,
            correo: formData.correo,
            telefono: formData.telefono || undefined,
            direccion: formData.direccion || undefined,
            rol_nombre: formData.rol_nombre,
            contrasena: formData.contrasena,
            estado: formData.estado,
          }),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar usuario');
        }

        const updatedUser = await response.json();

        // Actualizar estado local
        const updatedUsers = users.map((user) =>
          user.id === editingUser.id ? updatedUser : user
        );
        setUsers(updatedUsers);

        setAlert({
          type: 'success',
          message: 'Usuario actualizado correctamente',
        });
      } else {
        // Crear nuevo usuario
        const newUser = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          telefono: formData.telefono || '',
          direccion: formData.direccion || '',
          rol_nombre: formData.rol_nombre,
          contrasena: formData.contrasena,
          estado: formData.estado,
          fechaRegistro: new Date().toISOString(),
        };

        console.log(' Creando nuevo usuario...', newUser);

        const response = await fetch(`${API_URL}/usuarios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        });

        if (!response.ok) {
          throw new Error('Error al crear usuario');
        }

        const createdUser = await response.json();
        console.log(' Usuario creado:', createdUser);

        setUsers([...users, createdUser]);
        setAlert({ type: 'success', message: 'Usuario creado correctamente' });
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      setAlert({
        type: 'danger',
        message: 'Error al guardar el usuario',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleDelete = (user: Usuario) => {
    if (user.id === currentUser?.id) {
      setAlert({
        type: 'danger',
        message: 'No puedes eliminar tu propio usuario',
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    if (userToDelete.id === currentUser?.id) {
      setAlert({
        type: 'danger',
        message: 'No puedes eliminar tu propio usuario',
      });
      setShowDeleteModal(false);
      setUserToDelete(null);
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/usuarios/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      const updatedUsers = users.filter((user) => user.id !== userToDelete.id);
      setUsers(updatedUsers);
      setAlert({
        type: 'success',
        message: 'Usuario eliminado correctamente',
      });
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      setAlert({
        type: 'danger',
        message: 'Error al eliminar el usuario',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const toggleUserStatus = async (user: Usuario) => {
    if (user.id === currentUser?.id) {
      setAlert({
        type: 'danger',
        message: 'No puedes desactivar tu propio usuario',
      });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const nuevoEstado = user.estado === 'Activo' ? 'Inactivo' : 'Activo';

      const response = await fetch(`${API_URL}/usuarios/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: nuevoEstado,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado');
      }

      const updatedUser = await response.json();

      const updatedUsers = users.map((u) =>
        u.id === user.id ? updatedUser : u
      );
      setUsers(updatedUsers);

      setAlert({
        type: 'success',
        message: `Usuario ${
          user.estado === 'Activo' ? 'desactivado' : 'activado'
        } correctamente`,
      });
    } catch (error) {
      console.error('Error cambiando estado:', error);
      setAlert({
        type: 'danger',
        message: 'Error al cambiar el estado del usuario',
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

  const getRolBadge = (rol_nombre: string) => {
    const variants: { [key: string]: string } = {
      Administrador: 'danger',
      Veterinario: 'warning',
      Secretaria: 'info',
      Cliente: 'primary',
    };
    return <Badge bg={variants[rol_nombre] || 'secondary'}>{rol_nombre}</Badge>;
  };

  const isAdmin = currentUser?.rol_nombre === 'Administrador';

  if (!isAdmin) {
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
                  No tienes permisos para acceder a la gestión de usuarios. Esta
                  función está disponible solo para administradores.
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
                    <HiUsers size={20} /> Gestión de Usuarios
                  </h3>
                  <p className="text-muted mb-0">
                    Administra los usuarios del sistema ({users.length}{' '}
                    usuarios)
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
                      placeholder="Buscar usuarios..."
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
                    <PersonPlus /> Nuevo Usuario
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="p-0">
              {loading && users.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2 text-muted">Cargando usuarios...</p>
                </div>
              ) : (
                <>
                  <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Usuario</th>
                        <th>Contacto</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div>
                              <strong>
                                {user.nombre} {user.apellido}
                                {user.id === currentUser?.id && (
                                  <Badge
                                    bg="primary"
                                    className="ms-2"
                                    title="Tú"
                                  >
                                    Tú
                                  </Badge>
                                )}
                              </strong>
                              <br />
                              <small className="text-muted">
                                ID: {user.id}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div>{user.correo || 'Sin correo'}</div>
                              {user.telefono && (
                                <small className="text-muted">
                                  {user.telefono}
                                </small>
                              )}
                            </div>
                          </td>
                          <td>{getRolBadge(user.rol_nombre)}</td>
                          <td>{getEstadoBadge(user.estado)}</td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                id={`dropdown-${user.id}`}
                                disabled={loading}
                              >
                                <ThreeDotsVertical />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => handleShowModal(user)}
                                  disabled={loading}
                                >
                                  <Pencil className="me-2" />
                                  Editar
                                </Dropdown.Item>

                                <Dropdown.Item
                                  onClick={() => toggleUserStatus(user)}
                                  disabled={
                                    user.id === currentUser?.id || loading
                                  }
                                  className={
                                    user.id === currentUser?.id
                                      ? 'text-muted'
                                      : ''
                                  }
                                >
                                  {user.estado === 'Activo' ? (
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
                                  onClick={() => handleDelete(user)}
                                  disabled={
                                    user.id === currentUser?.id || loading
                                  }
                                  className={
                                    user.id === currentUser?.id
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
                      ))}
                    </tbody>
                  </Table>

                  {filteredUsers.length === 0 && !loading && (
                    <div className="text-center py-5">
                      <p className="text-muted">No se encontraron usuarios</p>
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
            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
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

            <Form.Group className="mb-3">
              <Form.Label>
                Correo Electrónico {formData.rol_nombre !== 'Cliente' && '*'}
              </Form.Label>
              <Form.Control
                type="email"
                value={formData.correo}
                onChange={(e) =>
                  setFormData({ ...formData, correo: e.target.value })
                }
                required={formData.rol_nombre !== 'Cliente'}
                disabled={loading}
                placeholder={
                  formData.rol_nombre === 'Cliente'
                    ? 'Opcional para clientes'
                    : 'Correo requerido'
                }
              />
              {formData.rol_nombre === 'Cliente' && (
                <Form.Text className="text-muted">
                  Opcional para usuarios con rol Cliente
                </Form.Text>
              )}
            </Form.Group>

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
                    placeholder="Número de teléfono"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
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
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña *</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.contrasena}
                    onChange={(e) =>
                      setFormData({ ...formData, contrasena: e.target.value })
                    }
                    required
                    placeholder="Mínimo 6 caracteres"
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Mínimo 6 caracteres
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rol *</Form.Label>
                  <Form.Select
                    value={formData.rol_nombre}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rol_nombre: e.target.value,
                      })
                    }
                    disabled={loading}
                  >
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.nombre}>
                        {rol.nombre} - {rol.descripcion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

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
                : editingUser
                ? 'Actualizar Usuario'
                : 'Crear Usuario'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete?.id === currentUser?.id ? (
            <div className="text-center text-danger">
              <PersonX size={48} className="mb-3" />
              <h5>No puedes eliminar tu propio usuario</h5>
              <p className="text-muted">
                Por seguridad, no está permitido eliminar la cuenta que estás
                usando actualmente.
              </p>
            </div>
          ) : (
            <>
              ¿Estás seguro de que deseas eliminar al usuario{' '}
              <strong>
                {userToDelete?.nombre} {userToDelete?.apellido}
              </strong>
              ?
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
            {userToDelete?.id === currentUser?.id ? 'Entendido' : 'Cancelar'}
          </Button>
          {userToDelete?.id !== currentUser?.id && (
            <Button variant="danger" onClick={confirmDelete} disabled={loading}>
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;
