import React, { useState, useEffect } from 'react';
import { IoCalendarOutline } from 'react-icons/io5';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, InputGroup, Dropdown } from 'react-bootstrap';
import { PlusCircle, Search, ThreeDotsVertical, Calendar, Clock } from 'react-bootstrap-icons';
import { useAuth } from '../../context/AuthContext';
import { citaService, type CreateCitaData, type AvailableSlot } from '../../services/citaService';
import { mascotaService } from '../../services/mascotaService';
import { usuarioService } from '../../services/usuarioService';
import type { Cita, Mascota, Usuario } from '../../types';

const CitasList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [veterinarios, setVeterinarios] = useState<Usuario[]>([]);
  const [filteredCitas, setFilteredCitas] = useState<Cita[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateCitaData>({
    mascota_id: '',
    usuario_id: '',
    fechaCita: '',
    horaCita: '',
    motivo: '',
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filtrar citas (solo UI)
  useEffect(() => {
    const filtered = citas.filter(cita => 
      cita.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.fechaCita.includes(searchTerm)
    );
    setFilteredCitas(filtered);
  }, [searchTerm, citas]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [citasData, mascotasData, usuariosData] = await Promise.all([
        citaService.getAllCitas(),
        mascotaService.getAllMascotas(),
        usuarioService.getAllUsuarios()
      ]);
      
      setCitas(citasData);
      setMascotas(mascotasData);
      
      // Filtrar veterinarios
      const vets = usuariosData.filter((u: Usuario) => 
        u.rol_nombre === 'Veterinario' && u.estado === 'Activo'
      );
      setVeterinarios(vets);
      
    } catch (error) {
      showError('Error al cargar los datos iniciales');
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

  // Handler para seleccionar fecha
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    const fechaStr = date.toISOString().split('T')[0];
    
    try {
      const slots = await citaService.getHorariosDisponibles(fechaStr);
      setAvailableSlots(slots);
      setFormData(prev => ({ ...prev, fechaCita: fechaStr }));
    } catch (error) {
      showError('Error al cargar horarios disponibles');
    }
  };

  // Handler para seleccionar hora
  const handleTimeSelect = (slot: AvailableSlot) => {
    if (!slot.disponible) {
      showError('Este horario no está disponible');
      return;
    }
    
    setFormData(prev => ({ ...prev, horaCita: slot.hora }));
    setShowCalendarModal(false);
    setShowModal(true);
  };

  // Handler para agendar cita
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas de UI
    if (!formData.mascota_id || !formData.usuario_id || !formData.motivo) {
      showError('Todos los campos son requeridos');
      return;
    }

    setLoading(true);
    try {
      await citaService.createCita(formData);
      await loadInitialData(); // Recargar citas
      showSuccess('Cita agendada correctamente');
      setShowModal(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  // Handler para cambiar estado
  const cambiarEstadoCita = async (cita: Cita, nuevoEstado: string) => {
    setLoading(true);
    try {
      await citaService.cambiarEstadoCita(cita.id, nuevoEstado);
      await loadInitialData(); // Recargar citas
      showSuccess(`Cita ${nuevoEstado.toLowerCase()} correctamente`);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al actualizar la cita');
    } finally {
      setLoading(false);
    }
  };

  // ... (el resto del JSX permanece similar pero más limpio)

  return (
    <Container fluid>
      {/* UI limpia - sin lógica de negocio */}
    </Container>
  );
};

export default CitasList;