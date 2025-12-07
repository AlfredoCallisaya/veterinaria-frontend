// En tu componente FacturasList
const API_URL = 'http://localhost:8000/api'; // Cambia a tu backend Django

// Cargar facturas
const loadFacturas = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${API_URL}/facturacion/facturas/?search=${searchTerm}`);
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

// Cargar consultas sin factura
const loadConsultasSinFactura = async () => {
  try {
    const response = await fetch(`${API_URL}/facturacion/facturas/consultas_sin_factura/`);
    if (response.ok) {
      const consultasData = await response.json();
      setConsultas(consultasData);
    } else {
      throw new Error('Error cargando consultas');
    }
  } catch (error) {
    console.error('Error cargando consultas:', error);
    setAlert({ type: 'danger', message: 'Error al cargar las consultas' });
  }
};

// Generar factura desde consulta
const handleGenerarFactura = async (consultaId: string) => {
  setLoading(true);
  try {
    const response = await fetch(`${API_URL}/facturacion/facturas/generar_desde_consulta/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consulta_id: consultaId }),
    });

    if (!response.ok) throw new Error('Error creando factura');

    const createdFactura = await response.json();
    setFacturas([...facturas, createdFactura]);
    
    // Recargar consultas sin factura
    await loadConsultasSinFactura();
    
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

// Registrar pago
const handleRegistrarPago = async () => {
  if (!selectedFactura) return;
  setLoading(true);

  try {
    const response = await fetch(
      `${API_URL}/facturacion/facturas/${selectedFactura.id}/registrar_pago/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo_pago: formData.metodo_pago,
          observaciones: formData.observaciones,
        }),
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

// Cargar estadísticas
const loadEstadisticas = async () => {
  try {
    const response = await fetch(`${API_URL}/facturacion/facturas/estadisticas/`);
    if (response.ok) {
      const stats = await response.json();
      // Usar las stats en tu UI
    }
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
};