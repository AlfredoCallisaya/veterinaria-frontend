import { apiService } from './apiService';
import type { Usuario } from '../types';

export interface CreateClienteData {
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  email: string;
  estado: 'Activo' | 'Inactivo';
}

export interface UpdateClienteData extends Partial<CreateClienteData> {
  id: string | number;
}

export interface ClienteConMascotas extends Usuario {
  mascotas_count: number;
  mascotas_names: string[];
}

class ClienteService {
  async getAllClientes(): Promise<ClienteConMascotas[]> {
    return apiService.get('/clientes/');
  }

  async getClienteById(id: string | number): Promise<ClienteConMascotas> {
    return apiService.get(`/clientes/${id}/`);
  }

  async createCliente(clienteData: CreateClienteData): Promise<Usuario> {
    return apiService.post('/clientes/', clienteData);
  }

  async updateCliente(clienteData: UpdateClienteData): Promise<Usuario> {
    return apiService.put(`/clientes/${clienteData.id}/`, clienteData);
  }

  async deleteCliente(id: string | number): Promise<void> {
    return apiService.delete(`/clientes/${id}/`);
  }

  async toggleClienteStatus(id: string | number, estado: 'Activo' | 'Inactivo'): Promise<Usuario> {
    return apiService.patch(`/clientes/${id}/`, { estado });
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Validar si se puede eliminar
  async validarEliminacion(id: string | number): Promise<{ puede_eliminar: boolean; razon?: string }> {
    return apiService.get(`/clientes/${id}/validar-eliminacion/`);
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Validar si se puede desactivar
  async validarDesactivacion(id: string | number): Promise<{ puede_desactivar: boolean; razon?: string }> {
    return apiService.get(`/clientes/${id}/validar-desactivacion/`);
  }
}

export const clienteService = new ClienteService();