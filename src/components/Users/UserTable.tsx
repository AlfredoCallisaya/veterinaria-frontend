// src/components/Users/UserTable.tsx
import React from "react";
import { Usuario } from "../../services/userService";

interface Props {
  usuarios: Usuario[];
  onEdit: (usuario: Usuario) => void;
  onDelete: (id: string) => void;
}

const UserTable: React.FC<Props> = ({ usuarios, onEdit, onDelete }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Rol</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {usuarios.map((u) => (
          <tr key={u.id}>
            <td>{u.nombre} {u.apellido}</td>
            <td>{u.rol_nombre}</td>
            <td>{u.correo}</td>
            <td>{u.telefono}</td>
            <td>{u.estado}</td>
            <td>
              <button onClick={() => onEdit(u)}>Editar</button>
              <button onClick={() => onDelete(u.id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
