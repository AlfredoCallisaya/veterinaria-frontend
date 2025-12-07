// src/pages/Users/UserManagement.tsx
import React, { useEffect, useState } from "react";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  Usuario
} from "../../services/userService";

import UserTable from "../../components/Users/UserTable";
import UserModal from "../../components/Users/UserModal";
import UserForm from "../../components/Users/UserForm";

const UserManagement: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  const loadUsuarios = async () => {
    const data = await getUsuarios();
    setUsuarios(data);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: Usuario) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteUsuario(id);
    loadUsuarios();
  };

  const handleSubmit = async (data: Partial<Usuario>) => {
    if (selectedUser) {
      await updateUsuario(selectedUser.id, data);
    } else {
      await createUsuario(data);
    }
    setModalOpen(false);
    loadUsuarios();
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  return (
    <div>
      <h1>Gestión de Usuarios</h1>
      <button onClick={handleCreate}>Nuevo Usuario</button>

      <UserTable usuarios={usuarios} onEdit={handleEdit} onDelete={handleDelete} />

      <UserModal open={modalOpen} onClose={() => setModalOpen(false)}>
        <UserForm initialData={selectedUser} onSubmit={handleSubmit} />
      </UserModal>
    </div>
  );
};

export default UserManagement;
