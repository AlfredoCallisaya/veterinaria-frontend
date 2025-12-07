// src/components/Users/UserForm.tsx
import React, { useState, useEffect } from "react";
import { Usuario } from "../../services/userService";

interface Props {
  initialData?: Usuario | null;
  onSubmit: (data: Partial<Usuario>) => void;
}

const UserForm: React.FC<Props> = ({ initialData, onSubmit }) => {
  const [form, setForm] = useState<Partial<Usuario>>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    direccion: "",
    rol_nombre: "",
    contrasena: "",
    estado: "Activo",
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
      <input type="text" name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required />
      <input type="email" name="correo" placeholder="Correo" value={form.correo} onChange={handleChange} required />

      <select name="rol_nombre" value={form.rol_nombre} onChange={handleChange} required>
        <option value="">Seleccione rol</option>
        <option value="Administrador">Administrador</option>
        <option value="Veterinario">Veterinario</option>
        <option value="Secretaria">Secretaria</option>
        <option value="Cliente">Cliente</option>
      </select>

      <input type="password" name="contrasena" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} required />

      <input type="text" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
      <input type="text" name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} />

      <button type="submit">Guardar</button>
    </form>
  );
};

export default UserForm;
