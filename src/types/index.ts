export interface Cliente {
  idCliente: number;
  nombres: string;
  apellidos: string;
  telefono?: string;
  direccion?: string;
  correo?: string;
  fechaRegistro: string;
  estado: 'Activo' | 'Inactivo';
}

export interface Mascota {
  idMascota: number;
  idCliente: number;
  nombreMascota: string;
  especie?: string;
  raza?: string;
  edad?: number;
  sexo?: 'M' | 'H' | string;
  peso?: number;
  fechaNacimiento?: string;
  caracteristicas?: string;
  estado: 'Activo' | 'Fallecido' | 'Transferido';
}

export interface UsuarioSistema {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  rol: 'Administrador' | 'Veterinario' | 'Secretaria' | 'Cliente';
  estado: 'Activo' | 'Inactivo' | 'Suspendido';
  fechaRegistro: string;
  ultimoAcceso?: string;
  especialidad?: string; 
  turno?: string; 
}

export interface Cita {
  idCita: number;
  fechaCita: string; 
  horaCita: string; 
  estado:
    | 'Programada'
    | 'Confirmada'
    | 'Completada'
    | 'Cancelada'
    | 'No Asistió';
  idCliente: number;
  idMascota: number;
  idVeterinario?: number; 
  tipo: 'Consulta' | 'Vacunación' | 'Estética' | 'Urgencia' | 'Control';
  motivo: string;
  notas?: string;
}

export interface Consulta {
  idConsulta: number;
  motivo: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  costo: number;
  estado: ' Pendiente' | 'Completada' | 'Cancelada';
  idCita?: number;
  idMascota: number;
  idVeterinario: number;
  fechaConsulta: string;
  proximaCita?: string;
}

export interface Producto {
  idProducto: number;
  nombreProducto: string;
  descripcion?: string;
  stock: number;
  precioCompra?: number;
  precioVenta: number;
  idProveedor?: number;
  idCategoria?: number;
  estado: 'Disponible' | 'Agotado' | 'Descontinuado';
}

export interface Factura {
  idFactura: number;
  fechaEmision: string;
  idCliente: number;
  idConsulta?: number;
  total: number;
  estadoPago: ' Pendiente' | 'Pagada' | 'Cancelada';
  idUsuario: number; 
  items: FacturaItem[];
}

export interface FacturaItem {
  idItem: number;
  idFactura: number;
  tipo: 'Consulta' | 'Producto' | 'Servicio';
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pago {
  idPago: number;
  idFactura: number;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Cheque';
  monto: number;
  fechaPago: string;
  estadoPago: 'Completado' | 'Pendiente' | 'Rechazado';
  referencia?: string;
}

export interface ClienteConMascotas extends Cliente {
  mascotas: Mascota[];
}

export interface MascotaConCliente extends Mascota {
  cliente: Cliente;
}

export interface CitaCompleta extends Cita {
  cliente: Cliente;
  mascota: Mascota;
  veterinario?: UsuarioSistema;
}

export interface ConsultaCompleta extends Consulta {
  mascota: MascotaConCliente;
  veterinario: UsuarioSistema;
  cita?: Cita;
}

export interface PermisosRol {
  gestionUsuarios: boolean;
  gestionClientes: boolean;
  gestionMascotas: boolean;
  gestionCitas: boolean;
  gestionConsultas: boolean;
  gestionFacturas: boolean;
  gestionProductos: boolean;
  verReportes: boolean;
  configuracionSistema: boolean;
}

export const permisosPorRol: Record<UsuarioSistema['rol'], PermisosRol> = {
  Administrador: {
    gestionUsuarios: true,
    gestionClientes: true,
    gestionMascotas: true,
    gestionCitas: true,
    gestionConsultas: true,
    gestionFacturas: true,
    gestionProductos: true,
    verReportes: true,
    configuracionSistema: true,
  },
  Veterinario: {
    gestionUsuarios: false,
    gestionClientes: true,
    gestionMascotas: true,
    gestionCitas: true,
    gestionConsultas: true,
    gestionFacturas: false,
    gestionProductos: false,
    verReportes: true,
    configuracionSistema: false,
  },
  Secretaria: {
    gestionUsuarios: false,
    gestionClientes: true,
    gestionMascotas: true,
    gestionCitas: true,
    gestionConsultas: false,
    gestionFacturas: true,
    gestionProductos: true,
    verReportes: true,
    configuracionSistema: false,
  },
  Cliente: {
    gestionUsuarios: false,
    gestionClientes: false,
    gestionMascotas: false, 
    gestionCitas: false,
    gestionConsultas: false, 
    gestionFacturas: false, 
    gestionProductos: false,
    verReportes: false,
    configuracionSistema: false,
  },
};

export const tienePermiso = (
  rol: UsuarioSistema['rol'],
  permiso: keyof PermisosRol
): boolean => {
  return permisosPorRol[rol]?.[permiso] || false;
};
