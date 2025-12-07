import { apiService } from './apiService';
import type { Cita } from '../types';

export interface CreateCitaData {
  mascota_id: string | number;
  usuario_id: string | number;
  fechaCita: string;
  horaCita: string;
  motivo: string;
}

export interface AvailableSlot {
  fecha: string;
  hora: string;
  disponible: boolean;
}

class CitaService {
  async getAllCitas(): Promise<Cita[]> {
    return apiService.get('/citas/');
  }

  async getCitaById(id: string | number): Promise<Cita> {
    return apiService.get(`/citas/${id}/`);
  }

  async createCita(citaData: CreateCitaData): Promise<Cita> {
    return apiService.post('/citas/', citaData);
  }

  async updateCita(id: string | number, citaData: Partial<Cita>): Promise<Cita> {
    return apiService.put(`/citas/${id}/`, citaData);
  }

  async cambiarEstadoCita(id: string | number, estado: string): Promise<Cita> {
    return apiService.patch(`/citas/${id}/`, { estado });
  }

  async deleteCita(id: string | number): Promise<void> {
    return apiService.delete(`/citas/${id}/`);
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Horarios disponibles
  async getHorariosDisponibles(fecha: string): Promise<AvailableSlot[]> {
    return apiService.get(`/citas/horarios-disponibles/?fecha=${fecha}`);
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Validación de horario
  async validarHorarioDisponible(fecha: string, hora: string): Promise<boolean> {
    const response = await apiService.get(`/citas/validar-horario/?fecha=${fecha}&hora=${hora}`);
    return response.disponible;
  }
}

export const citaService = new CitaService();