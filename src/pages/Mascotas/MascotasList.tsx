// En tu componente MascotasList actualizado
const API_URL = 'http://localhost:8000/api';

// Cargar mascotas
const loadMascotas = async () => {
  setLoading(true);
  try {
    const response = await fetch(
      `${API_URL}/mascotas/mascotas/?search=${searchTerm}`
    );
    if (!response.ok) throw new Error('Error cargando mascotas');
    
    const mascotasData = await response.json();
    setMascotas(mascotasData);
  } catch (error) {
    console.error('Error cargando mascotas:', error);
    setAlert({ type: 'danger', message: 'Error al cargar las mascotas' });
  } finally {
    setLoading(false);
  }
};

// Cargar clientes (usuarios con rol cliente)
const loadUsuarios = async () => {
  try {
    const response = await fetch(`${API_URL}/usuarios/usuarios/?rol=Cliente`);
    if (!response.ok) throw new Error('Error cargando usuarios');

    const usuariosData = await response.json();
    setUsuarios(usuariosData);
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    setAlert({ type: 'danger', message: 'Error al cargar los clientes' });
  }
};

// Crear o actualizar mascota
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.usuario_id) {
    setAlert({ type: 'danger', message: 'Debe seleccionar un cliente' });
    setTimeout(() => setAlert(null), 3000);
    return;
  }

  setLoading(true);

  try {
    const url = editingMascota 
      ? `${API_URL}/mascotas/mascotas/${editingMascota.id}/`
      : `${API_URL}/mascotas/mascotas/`;

    const method = editingMascota ? 'PUT' : 'POST';

    const payload = {
      nombre: formData.nombre,
      especie: formData.especie,
      raza: formData.raza,
      edad: formData.edad,
      sexo: formData.sexo,
      usuario: formData.usuario_id, // Cambiado de usuario_id a usuario
      observaciones: ''
    };

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Error guardando mascota');

    const savedMascota = await response.json();

    if (editingMascota) {
      const updatedMascotas = mascotas.map((mascota) =>
        mascota.id === editingMascota.id ? savedMascota : mascota
      );
      setMascotas(updatedMascotas);
      setAlert({ type: 'success', message: 'Mascota actualizada correctamente' });
    } else {
      setMascotas([...mascotas, savedMascota]);
      setAlert({ type: 'success', message: 'Mascota creada correctamente' });
    }

    handleCloseModal();
  } catch (error) {
    console.error('Error guardando mascota:', error);
    setAlert({ type: 'danger', message: 'Error al guardar la mascota' });
  } finally {
    setLoading(false);
    setTimeout(() => setAlert(null), 3000);
  }
};

// Cambiar estado de mascota (activar/desactivar)
const toggleMascotaStatus = async (mascota: Mascota) => {
  setLoading(true);
  try {
    const nuevoEstado = mascota.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const action = nuevoEstado === 'Activo' ? 'activar' : 'desactivar';

    const response = await fetch(
      `${API_URL}/mascotas/mascotas/${mascota.id}/${action}/`,
      { method: 'POST' }
    );

    if (!response.ok) throw new Error('Error cambiando estado');

    const updatedMascota = await response.json();

    const updatedMascotas = mascotas.map((m) =>
      m.id === mascota.id ? updatedMascota : m
    );
    setMascotas(updatedMascotas);

    setAlert({
      type: 'success',
      message: `Mascota ${mascota.estado === 'Activo' ? 'desactivada' : 'activada'} correctamente`,
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

// Eliminar mascota
const confirmDelete = async () => {
  if (mascotaToDelete) {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/mascotas/mascotas/${mascotaToDelete.id}/`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Error eliminando mascota');

      // En el backend hacemos eliminación suave, así que actualizamos el estado
      const updatedMascotas = mascotas.filter(
        (mascota) => mascota.id !== mascotaToDelete.id
      );
      setMascotas(updatedMascotas);
      
      setAlert({ type: 'success', message: 'Mascota eliminada correctamente' });
      setShowDeleteModal(false);
      setMascotaToDelete(null);
    } catch (error) {
      console.error('Error eliminando mascota:', error);
      setAlert({ type: 'danger', message: 'Error al eliminar la mascota' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 3000);
    }
  }
};

// Obtener especies disponibles
const loadEspecies = async () => {
  try {
    const response = await fetch(`${API_URL}/mascotas/mascotas/especies/`);
    if (response.ok) {
      const especiesData = await response.json();
      // Usar estas especies en tu formulario
    }
  } catch (error) {
    console.error('Error cargando especies:', error);
  }
};