import { apiService } from './apiService';
import type { Mascota, Usuario } from '../types';

export interface CreateMascotaData {
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  sexo: 'M' | 'H';
  usuario_id: string | number;
  observaciones?: string;
}

export interface UpdateMascotaData {
  nombre?: string;
  especie?: string;
  raza?: string;
  edad?: number;
  sexo?: 'M' | 'H';
  usuario_id?: string | number;
  estado?: 'Activo' | 'Inactivo';
  observaciones?: string;
}

export interface MascotaStats {
  total_mascotas: number;
  mascotas_activas: number;
  mascotas_inactivas: number;
  especies_stats: Array<{
    especie: string;
    total: number;
  }>;
}

class MascotaService {
  async getAllMascotas(searchTerm?: string): Promise<Mascota[]> {
    const url = searchTerm ? `/mascotas/mascotas/?search=${searchTerm}` : '/mascotas/mascotas/';
    return apiService.get(url);
  }

  async getMascotaById(id: string | number): Promise<Mascota> {
    return apiService.get(`/mascotas/mascotas/${id}/`);
  }

  async createMascota(mascotaData: CreateMascotaData): Promise<Mascota> {
    // Adaptar datos para el backend Django
    const payload = {
      ...mascotaData,
      usuario: mascotaData.usuario_id // Cambiar usuario_id a usuario para Django
    };
    delete (payload as any).usuario_id;
    
    return apiService.post('/mascotas/mascotas/', payload);
  }

  async updateMascota(id: string | number, mascotaData: UpdateMascotaData): Promise<Mascota> {
    // Adaptar datos para el backend Django
    const payload: any = { ...mascotaData };
    if (mascotaData.usuario_id) {
      payload.usuario = mascotaData.usuario_id;
      delete payload.usuario_id;
    }
    
    return apiService.put(`/mascotas/mascotas/${id}/`, payload);
  }

  async deleteMascota(id: string | number): Promise<void> {
    return apiService.delete(`/mascotas/mascotas/${id}/`);
  }

  async activarMascota(id: string | number): Promise<Mascota> {
    return apiService.post(`/mascotas/mascotas/${id}/activar/`);
  }

  async desactivarMascota(id: string | number): Promise<Mascota> {
    return apiService.post(`/mascotas/mascotas/${id}/desactivar/`);
  }

  async getMascotasPorCliente(clienteId: string | number): Promise<Mascota[]> {
    return apiService.get(`/mascotas/mascotas/por-cliente/?cliente_id=${clienteId}`);
  }

  async getEstadisticas(): Promise<MascotaStats> {
    return apiService.get('/mascotas/mascotas/estadisticas/');
  }

  async getEspeciesDisponibles(): Promise<string[]> {
    return apiService.get('/mascotas/mascotas/especies/');
  }
}

export const mascotaService = new MascotaService();