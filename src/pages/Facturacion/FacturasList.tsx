import React, { useState, useEffect } from 'react';
import { FaMoneyBill1Wave } from 'react-icons/fa6';
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
  Eye,
  FileEarmarkText,
  Cash,
  Calendar,
  Printer,
} from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import { Factura, Consulta, Mascota, Usuario } from '../../types';

const FacturasList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredFacturas, setFilteredFacturas] = useState<Factura[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(
    null
  );
  const [alert, setAlert] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    consulta_id: '',
    metodo_pago: 'Efectivo',
    observaciones: '',
  });

  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    loadFacturas();
    loadConsultas();
    loadMascotas();
    loadUsuarios();
  }, []);

  useEffect(() => {
    const filtered = facturas.filter(
      (factura) =>
        factura.numero_factura
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getClienteNombre(factura.cliente_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        factura.estado.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFacturas(filtered);
  }, [searchTerm, facturas]);

  const loadFacturas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/facturas`);
      if (response.ok) {
        const facturasData = await response.json();
        setFacturas(facturasData);
      } else {
        throw new Error('Error cargando facturas');
      }
    } catch (error) {
      console.error('Error cargando facturas:', error);
      setAlert({ type: 'danger', message: 'Error al cargar las facturas' });
    } finally {
      setLoading(false);
    }
  };

  const loadConsultas = async () => {
    try {
      const response = await fetch(`${API_URL}/consultas`);
      if (response.ok) {
        const consultasData = await response.json();
        // Filtrar consultas completadas sin factura
        const consultasSinFactura = consultasData.filter(
          (consulta: Consulta) =>
            consulta.estado === 'Completada' &&
            !facturas.some((factura) => factura.consulta_id == consulta.id)
        );
        setConsultas(consultasSinFactura);
      } else {
        throw new Error('Error cargando consultas');
      }
    } catch (error) {
      console.error('Error cargando consultas:', error);
      setAlert({ type: 'danger', message: 'Error al cargar las consultas' });
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

  const loadUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      if (response.ok) {
        const usuariosData = await response.json();
        setUsuarios(usuariosData);
      } else {
        throw new Error('Error cargando usuarios');
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setAlert({ type: 'danger', message: 'Error al cargar los usuarios' });
    }
  };

  const generarNumeroFactura = (): string => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `FACT-${timestamp}-${random}`;
  };

  const getClienteNombre = (clienteId: number | string) => {
    const cliente = usuarios.find(
      (u) => u.id == clienteId && u.rol_nombre === 'Cliente'
    );
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'N/A';
  };

  const getClienteInfo = (clienteId: number | string) => {
    return (
      usuarios.find((u) => u.id == clienteId && u.rol_nombre === 'Cliente') ||
      null
    );
  };

  const getConsultaInfo = (consultaId: number | string) => {
    const consulta = consultas.find((c) => c.id == consultaId);
    return consulta || null;
  };

  const getMascotaDeConsulta = (consultaId: number | string) => {
    const consulta = consultas.find((c) => c.id == consultaId);
    if (!consulta) return null;
    const mascota = mascotas.find((m) => m.id == consulta.mascota_id);
    return mascota;
  };

  const getEstadoBadge = (estado: string) => {
    const variants: { [key: string]: string } = {
      Pagada: 'success',
      Pendiente: 'warning',
      Vencida: 'danger',
      Anulada: 'secondary',
    };
    return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
  };

  const calcularTotales = (costo: number) => {
    const subtotal = costo;
    const iva = subtotal * 0.13;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const handleShowModal = () => {
    loadConsultas();
    setShowModal(true);
  };

  const handleShowDetailModal = (factura: Factura) => {
    setSelectedFactura(factura);
    const consultaInfo = getConsultaInfo(factura.consulta_id);
    setSelectedConsulta(consultaInfo || null);
    setShowDetailModal(true);
  };

  const handleShowPagoModal = (factura: Factura) => {
    setSelectedFactura(factura);
    setFormData({
      consulta_id: factura.consulta_id.toString(),
      metodo_pago: factura.metodo_pago || 'Efectivo',
      observaciones: factura.observaciones || '',
    });
    setShowPagoModal(true);
  };

  const handleGenerarFactura = async (consultaId: string) => {
    const consulta = consultas.find((c) => c.id == consultaId);
    if (!consulta) return;

    setLoading(true);

    try {
      const mascota = mascotas.find((m) => m.id == consulta.mascota_id);
      if (!mascota) throw new Error('Mascota no encontrada');

      const { subtotal, iva, total } = calcularTotales(consulta.costo);
      const fechaEmision = new Date().toISOString().split('T')[0];
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

      const nuevaFactura = {
        cliente_id: mascota.usuario_id, // En tu estructura, usuario_id es el dueño
        consulta_id: consultaId,
        numero_factura: generarNumeroFactura(),
        fecha_emision: fechaEmision,
        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
        subtotal: subtotal,
        iva: iva,
        total: total,
        estado: 'Pendiente' as const,
        observaciones: `Factura por consulta médica - ${consulta.motivo}`,
      };

      const response = await fetch(`${API_URL}/facturas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaFactura),
      });

      if (!response.ok) throw new Error('Error creando factura');

      const createdFactura = await response.json();
      setFacturas([...facturas, createdFactura]);

      // Actualizar lista de consultas sin factura
      const updatedConsultas = consultas.filter((c) => c.id != consultaId);
      setConsultas(updatedConsultas);

      setAlert({ type: 'success', message: 'Factura generada correctamente' });
      setShowModal(false);
    } catch (error) {
      console.error('Error generando factura:', error);
      setAlert({ type: 'danger', message: 'Error al generar la factura' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleRegistrarPago = async () => {
    if (!selectedFactura) return;

    setLoading(true);

    try {
      const facturaActualizada = {
        ...selectedFactura,
        estado: 'Pagada' as const,
        metodo_pago: formData.metodo_pago,
        fecha_pago: new Date().toISOString().split('T')[0],
        observaciones: formData.observaciones || selectedFactura.observaciones,
      };

      const response = await fetch(
        `${API_URL}/facturas/${selectedFactura.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(facturaActualizada),
        }
      );

      if (!response.ok) throw new Error('Error registrando pago');

      const updatedFactura = await response.json();
      const updatedFacturas = facturas.map((f) =>
        f.id === selectedFactura.id ? updatedFactura : f
      );
      setFacturas(updatedFacturas);
      setAlert({ type: 'success', message: 'Pago registrado correctamente' });
      setShowPagoModal(false);
    } catch (error) {
      console.error('Error registrando pago:', error);
      setAlert({ type: 'danger', message: 'Error al registrar el pago' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleAnularFactura = async (factura: Factura) => {
    if (
      !window.confirm(
        `¿Estás seguro de anular la factura ${factura.numero_factura}?`
      )
    )
      return;

    setLoading(true);

    try {
      const facturaAnulada = {
        ...factura,
        estado: 'Anulada' as const,
        observaciones: `Factura anulada - ${factura.observaciones || ''}`,
      };

      const response = await fetch(`${API_URL}/facturas/${factura.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facturaAnulada),
      });

      if (!response.ok) throw new Error('Error anulando factura');

      const updatedFactura = await response.json();
      const updatedFacturas = facturas.map((f) =>
        f.id === factura.id ? updatedFactura : f
      );
      setFacturas(updatedFacturas);
      setAlert({ type: 'success', message: 'Factura anulada correctamente' });
    } catch (error) {
      console.error('Error anulando factura:', error);
      setAlert({ type: 'danger', message: 'Error al anular la factura' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const imprimirFactura = (factura: Factura) => {
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) return;

    const consultaInfo = getConsultaInfo(factura.consulta_id);
    const mascotaInfo = getMascotaDeConsulta(factura.consulta_id);
    const clienteInfo = getClienteInfo(factura.cliente_id);

    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura ${factura.numero_factura}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f5f5f5; }
          .total { text-align: right; font-weight: bold; margin-top: 20px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>VETERINARIA MASCOTAS FELICES</h1>
          <h2>FACTURA ${factura.numero_factura}</h2>
        </div>
        
        <div class="info">
          <p><strong>Cliente:</strong> ${
            clienteInfo
              ? `${clienteInfo.nombre} ${clienteInfo.apellido}`
              : 'N/A'
          }</p>
          <p><strong>Mascota:</strong> ${
            mascotaInfo ? mascotaInfo.nombre : 'N/A'
          }</p>
          <p><strong>Fecha Emisión:</strong> ${new Date(
            factura.fecha_emision
          ).toLocaleDateString()}</p>
          <p><strong>Fecha Vencimiento:</strong> ${new Date(
            factura.fecha_vencimiento
          ).toLocaleDateString()}</p>
          <p><strong>Estado:</strong> ${factura.estado}</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Subtotal</th>
              <th>IVA (13%)</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Consulta médica - ${
                consultaInfo ? consultaInfo.motivo : 'N/A'
              }</td>
              <td>$${factura.subtotal.toFixed(2)}</td>
              <td>$${factura.iva.toFixed(2)}</td>
              <td>$${factura.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          <p>TOTAL: $${factura.total.toFixed(2)}</p>
        </div>

        ${
          factura.observaciones
            ? `
        <div class="observaciones">
          <p><strong>Observaciones:</strong> ${factura.observaciones}</p>
        </div>
        `
            : ''
        }

        <div class="footer">
          <p>Gracias por confiar en nosotros</p>
          <p>Veterinaria Mascotas Felices - Tel: 555-1234</p>
        </div>
      </body>
      </html>
    `;

    ventanaImpresion.document.write(contenido);
    ventanaImpresion.document.close();
    ventanaImpresion.print();
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
                  <FileEarmarkText size={48} />
                </div>
                <h3>Acceso Restringido</h3>
                <p className="text-muted">
                  No tienes permisos para acceder a la gestión de facturas.
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
                    <FaMoneyBill1Wave className="m-2" />
                    Gestión de Facturas
                  </h3>
                  <p className="text-muted mb-0">
                    Administración de facturas del sistema ({facturas.length}{' '}
                    facturas)
                  </p>
                </Col>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar facturas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={2} className="text-end">
                  <Button variant="primary" onClick={handleShowModal}>
                    <PlusCircle className="me-2" />
                    Nueva Factura
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="mb-4">
            <Col md={3}>
              <Card className="bg-primary text-white">
                <Card.Body className="text-center">
                  <h4>
                    Bs.
                    {facturas.reduce((sum, f) => sum + f.total, 0).toFixed(2)}
                  </h4>
                  <small>Total Facturado</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-success text-white">
                <Card.Body className="text-center">
                  <h4>
                    Bs.
                    {facturas
                      .filter((f) => f.estado === 'Pagada')
                      .reduce((sum, f) => sum + f.total, 0)
                      .toFixed(2)}
                  </h4>
                  <small>Total Pagado</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-warning text-dark">
                <Card.Body className="text-center">
                  <h4>
                    Bs.
                    {facturas
                      .filter((f) => f.estado === 'Pendiente')
                      .reduce((sum, f) => sum + f.total, 0)
                      .toFixed(2)}
                  </h4>
                  <small>Total Pendiente</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="bg-danger text-white">
                <Card.Body className="text-center">
                  <h4>
                    {facturas.filter((f) => f.estado === 'Vencida').length}
                  </h4>
                  <small>Facturas Vencidas</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>N° Factura</th>
                    <th>Cliente</th>
                    <th>Fecha Emisión</th>
                    <th>Fecha Vencimiento</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFacturas.map((factura) => (
                    <tr key={factura.id}>
                      <td>
                        <strong>{factura.numero_factura}</strong>
                      </td>
                      <td>{getClienteNombre(factura.cliente_id)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Calendar size={14} />
                          {new Date(factura.fecha_emision).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Calendar size={14} />
                          {new Date(
                            factura.fecha_vencimiento
                          ).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <Badge bg="success" >
                          Bs.{factura.total.toFixed(2)}
                        </Badge>
                      </td>
                      <td>{getEstadoBadge(factura.estado)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm">
                            <ThreeDotsVertical />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => handleShowDetailModal(factura)}
                            >
                              <Eye className="me-2" />
                              Ver Detalles
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => imprimirFactura(factura)}
                            >
                              <Printer className="me-2" />
                              Imprimir
                            </Dropdown.Item>
                            {factura.estado === 'Pendiente' && (
                              <>
                                <Dropdown.Item
                                  onClick={() => handleShowPagoModal(factura)}
                                >
                                  <Cash className="me-2" />
                                  Registrar Pago
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item
                                  onClick={() => handleAnularFactura(factura)}
                                  className="text-danger"
                                >
                                  Anular Factura
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

              {filteredFacturas.length === 0 && !loading && (
                <div className="text-center py-5">
                  <p className="text-muted">No se encontraron facturas</p>
                  <Button variant="primary" onClick={handleShowModal}>
                    Generar Primera Factura
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Generar Nueva Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>Consultas Pendientes de Facturación</h6>
          {consultas.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">
                No hay consultas pendientes de facturación
              </p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Mascota</th>
                  <th>Dueño</th>
                  <th>Motivo</th>
                  <th>Costo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {consultas.map((consulta) => {
                  const mascota = mascotas.find(
                    (m) => m.id == consulta.mascota_id
                  );
                  const cliente = getClienteInfo(mascota?.usuario_id || '');
                  const { subtotal, iva, total } = calcularTotales(
                    consulta.costo
                  );

                  return (
                    <tr key={consulta.id}>
                      <td>
                        {new Date(consulta.fecha_consulta).toLocaleDateString()}
                      </td>
                      <td>{mascota?.nombre || 'N/A'}</td>
                      <td>
                        {cliente
                          ? `${cliente.nombre} ${cliente.apellido}`
                          : 'N/A'}
                      </td>
                      <td>
                        <small className="text-muted">{consulta.motivo}</small>
                      </td>
                      <td>
                        <div>
                          <small>Sub: Bs.{subtotal.toFixed(2)}</small>
                          <br />
                          <small>IVA: Bs.{iva.toFixed(2)}</small>
                          <br />
                          <strong>Total: Bs.{total.toFixed(2)}</strong>
                        </div>
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleGenerarFactura(consulta.id.toString())
                          }
                          disabled={loading}
                        >
                          Generar Factura
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalles de Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFactura && (
            <Row>
              <Col md={6}>
                <h6>Información de la Factura</h6>
                <Table size="sm" borderless>
                  <tbody>
                    <tr>
                      <td>
                        <strong>N° Factura:</strong>
                      </td>
                      <td>{selectedFactura.numero_factura}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Cliente:</strong>
                      </td>
                      <td>{getClienteNombre(selectedFactura.cliente_id)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Fecha Emisión:</strong>
                      </td>
                      <td>
                        {new Date(
                          selectedFactura.fecha_emision
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Fecha Vencimiento:</strong>
                      </td>
                      <td>
                        {new Date(
                          selectedFactura.fecha_vencimiento
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Estado:</strong>
                      </td>
                      <td>{getEstadoBadge(selectedFactura.estado)}</td>
                    </tr>
                    {selectedFactura.metodo_pago && (
                      <tr>
                        <td>
                          <strong>Método Pago:</strong>
                        </td>
                        <td>{selectedFactura.metodo_pago}</td>
                      </tr>
                    )}
                    {selectedFactura.fecha_pago && (
                      <tr>
                        <td>
                          <strong>Fecha Pago:</strong>
                        </td>
                        <td>
                          {new Date(
                            selectedFactura.fecha_pago
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h6>Detalles de la Consulta</h6>
                {selectedConsulta ? (
                  <Table size="sm" borderless>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Mascota:</strong>
                        </td>
                        <td>
                          {getMascotaDeConsulta(selectedConsulta.id)?.nombre ||
                            'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Fecha Consulta:</strong>
                        </td>
                        <td>
                          {new Date(
                            selectedConsulta.fecha_consulta
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Motivo:</strong>
                        </td>
                        <td>{selectedConsulta.motivo}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Diagnóstico:</strong>
                        </td>
                        <td>{selectedConsulta.diagnostico}</td>
                      </tr>
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted">
                    Información de consulta no disponible
                  </p>
                )}
              </Col>

              <Col md={12} className="mt-4">
                <h6>Desglose de Costos</h6>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Subtotal</th>
                      <th>IVA (13%)</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Consulta Médica</td>
                      <td>Bs.{selectedFactura.subtotal.toFixed(2)}</td>
                      <td>Bs.{selectedFactura.iva.toFixed(2)}</td>
                      <td>Bs.{selectedFactura.total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>

              {selectedFactura.observaciones && (
                <Col md={12} className="mt-3">
                  <h6>Observaciones</h6>
                  <Card>
                    <Card.Body>
                      <p>{selectedFactura.observaciones}</p>
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
          {selectedFactura && (
            <Button
              variant="primary"
              onClick={() => imprimirFactura(selectedFactura)}
            >
              <Printer className="me-2" />
              Imprimir
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showPagoModal} onHide={() => setShowPagoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Pago</Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegistrarPago();
          }}
        >
          <Modal.Body>
            {selectedFactura && (
              <>
                <div className="mb-3">
                  <p>
                    <strong>Factura:</strong> {selectedFactura.numero_factura}
                  </p>
                  <p>
                    <strong>Cliente:</strong>{' '}
                    {getClienteNombre(selectedFactura.cliente_id)}
                  </p>
                  <p>
                    <strong>Total a Pagar:</strong> Bs.
                    {selectedFactura.total.toFixed(2)}
                  </p>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Método de Pago *</Form.Label>
                  <Form.Select
                    value={formData.metodo_pago}
                    onChange={(e) =>
                      setFormData({ ...formData, metodo_pago: e.target.value })
                    }
                    required
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta Débito">Tarjeta Débito</option>
                    <option value="Tarjeta Crédito">Tarjeta Crédito</option>
                    <option value="Transferencia">
                      Transferencia Bancaria
                    </option>
                    <option value="Cheque">Cheque</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        observaciones: e.target.value,
                      })
                    }
                    placeholder="Observaciones adicionales sobre el pago..."
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPagoModal(false)}>
              Cancelar
            </Button>
            <Button variant="success" type="submit" disabled={loading}>
              <Cash className="me-2" />
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default FacturasList;
