export interface Usuario {
  id: number | string;
  nombre: string;
  apellido: string;
  correo: string;
  rol_nombre: string;
  contrasena: string;
  telefono?: string;
  direccion?: string;
  estado?: 'Activo' | 'Inactivo';
  fechaRegistro?: string;
}

export interface Mascota {
  id: number | string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  sexo: 'M' | 'H';
  usuario_id: number | string;
  estado: 'Activo' | 'Inactivo';
  fecha_registro: string;
}

export interface Cita {
  id: number | string;
  mascota_id: number | string;
  usuario_id: number | string;
  fechaCita: string;
  horaCita: string;
  motivo: string;
  estado: 'Agendada' | 'Completada' | 'Cancelada';
  fechaRegistro: string;
}

export interface Consulta {
  id: number | string;
  mascota_id: number | string;
  veterinario_id: number | string;
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

export interface Factura {
  id: number | string;
  cliente_id: number | string;
  consulta_id: number | string;
  numero_factura: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: 'Pagada' | 'Pendiente' | 'Vencida' | 'Anulada';
  metodo_pago?: string;
  fecha_pago?: string;
  observaciones?: string;
}

export type Cliente = Usuario;
