import { apiService } from './apiService';
import type { Consulta, Mascota } from '../types';

export interface CreateConsultaData {
  mascota_id: string | number;
  veterinario_id: string | number;
  fecha_consulta: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  medicamentos?: string;
  observaciones?: string;
  costo: number;
  peso?: number;
  temperatura?: number;
  estado: 'Completada' | 'Pendiente' | 'Cancelada';
}

export interface UpdateConsultaData extends Partial<CreateConsultaData> {
  id: string | number;
}

export interface ConsultaConDetalles extends Consulta {
  mascota_nombre: string;
  mascota_especie: string;
  veterinario_nombre: string;
  cliente_nombre: string;
}

export interface MascotaConConsultas extends Mascota {
  consultas_count: number;
  consultas_recientes: Consulta[];
}

class ConsultaService {
  async getAllConsultas(): Promise<ConsultaConDetalles[]> {
    return apiService.get('/consultas/');
  }

  async getConsultaById(id: string | number): Promise<ConsultaConDetalles> {
    return apiService.get(`/consultas/${id}/`);
  }

  async createConsulta(consultaData: CreateConsultaData): Promise<Consulta> {
    return apiService.post('/consultas/', consultaData);
  }

  async updateConsulta(consultaData: UpdateConsultaData): Promise<Consulta> {
    return apiService.put(`/consultas/${consultaData.id}/`, consultaData);
  }

  async deleteConsulta(id: string | number): Promise<void> {
    return apiService.delete(`/consultas/${id}/`);
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Consultas por mascota
  async getConsultasPorMascota(mascotaId: string | number): Promise<Consulta[]> {
    return apiService.get(`/consultas/por-mascota/${mascotaId}/`);
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Mascotas con historial médico
  async getMascotasConHistorial(): Promise<MascotaConConsultas[]> {
    return apiService.get('/consultas/mascotas-con-historial/');
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Estadísticas de consultas
  async getEstadisticasConsultas(): Promise<{
    total_consultas: number;
    consultas_completadas: number;
    consultas_pendientes: number;
    ingresos_totales: number;
  }> {
    return apiService.get('/consultas/estadisticas/');
  }
}

export const consultaService = new ConsultaService();