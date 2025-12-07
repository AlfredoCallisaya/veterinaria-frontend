import axios from "axios";

const API_URL = "http://localhost:3001/usuarios";

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  rol_nombre: string;
  contrasena: string;
  estado: string;
  fechaRegistro?: string;
}

// Obtener todos
export const getUsuarios = async () => {
  const res = await axios.get<Usuario[]>(API_URL);
  return res.data;
};

// Crear usuario
export const createUsuario = async (data: Partial<Usuario>) => {
  const res = await axios.post<Usuario>(API_URL, data);
  return res.data;
};

// Actualizar usuario
export const updateUsuario = async (id: string, data: Partial<Usuario>) => {
  const res = await axios.put<Usuario>(`${API_URL}/${id}`, data);
  return res.data;
};

// Eliminar
export const deleteUsuario = async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
};
