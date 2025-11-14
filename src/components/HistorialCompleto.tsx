const HistorialCompleto: React.FC = () => {
  const [consultas, setConsultas] = useState<any[]>([]);

  const loadHistorial = async () => {
    const [resConsultas, resClientes, resMascotas] = await Promise.all([
      fetch(`${API_URL}/consultas`),
      fetch(`${API_URL}/clientes`),
      fetch(`${API_URL}/mascotas`),
    ]);
  };

  return (
    <Card>
      <Card.Header>
        <h4>📋 Historial Clínico Completo</h4>
        <p className="text-muted mb-0">
          Todas las consultas de todos los clientes ({consultas.length}{' '}
          registros)
        </p>
      </Card.Header>
      <Card.Body>
        <Table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Mascota</th>
              <th>Dueño</th>
              <th>Tipo Dueño</th>
              <th>Veterinario</th>
              <th>Motivo</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((consulta) => (
              <tr key={consulta.id}>
                <td>{consulta.fecha_consulta}</td>
                <td>{consulta.mascota_nombre}</td>
                <td>{consulta.cliente_nombre}</td>
                <td>
                  <Badge
                    bg={
                      consulta.cliente_tipo === 'usuario'
                        ? 'primary'
                        : 'secondary'
                    }
                  >
                    {consulta.cliente_tipo === 'usuario'
                      ? 'Usuario'
                      : 'Directo'}
                  </Badge>
                </td>
                <td>{consulta.veterinario_nombre}</td>
                <td>{consulta.motivo}</td>
                <td>${consulta.costo}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
