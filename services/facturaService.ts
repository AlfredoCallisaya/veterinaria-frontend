import { apiService } from './apiService';
import type { Factura, Consulta } from '../../types';

export interface CreateFacturaData {
  consulta_id: string | number;
  metodo_pago?: string;
  observaciones?: string;
}

export interface UpdateFacturaData extends Partial<Factura> {
  id: string | number;
}

export interface FacturaConDetalles extends Factura {
  cliente_nombre: string;
  mascota_nombre: string;
  consulta_motivo: string;
  veterinario_nombre: string;
}

export interface ConsultaParaFacturar extends Consulta {
  mascota_nombre: string;
  cliente_nombre: string;
  subtotal: number;
  iva: number;
  total: number;
}

export interface EstadisticasFacturacion {
  total_facturado: number;
  total_pagado: number;
  total_pendiente: number;
  facturas_vencidas: number;
  facturas_por_mes: Array<{ mes: string; total: number }>;
}

class FacturaService {
  async getAllFacturas(): Promise<FacturaConDetalles[]> {
    return apiService.get('/facturas/');
  }

  async getFacturaById(id: string | number): Promise<FacturaConDetalles> {
    return apiService.get(`/facturas/${id}/`);
  }

  async createFactura(facturaData: CreateFacturaData): Promise<Factura> {
    return apiService.post('/facturas/', facturaData);
  }

  async updateFactura(facturaData: UpdateFacturaData): Promise<Factura> {
    return apiService.put(`/facturas/${facturaData.id}/`, facturaData);
  }

  async deleteFactura(id: string | number): Promise<void> {
    return apiService.delete(`/facturas/${id}/`);
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Registrar pago
  async registrarPago(id: string | number, metodo_pago: string, observaciones?: string): Promise<Factura> {
    return apiService.patch(`/facturas/${id}/registrar-pago/`, {
      metodo_pago,
      observaciones
    });
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Anular factura
  async anularFactura(id: string | number, motivo?: string): Promise<Factura> {
    return apiService.patch(`/facturas/${id}/anular/`, { motivo });
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Consultas pendientes de facturación
  async getConsultasParaFacturar(): Promise<ConsultaParaFacturar[]> {
    return apiService.get('/facturas/consultas-pendientes/');
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Estadísticas de facturación
  async getEstadisticas(): Promise<EstadisticasFacturacion> {
    return apiService.get('/facturas/estadisticas/');
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Generar PDF
  async generarPDF(id: string | number): Promise<{ pdf_url: string }> {
    return apiService.get(`/facturas/${id}/generar-pdf/`);
  }

  // ✅ LÓGICA MOVIDA AL BACKEND: Validar si se puede anular
  async validarAnulacion(id: string | number): Promise<{ puede_anular: boolean; razon?: string }> {
    return apiService.get(`/facturas/${id}/validar-anulacion/`);
  }
}

export const facturaService = new FacturaService();