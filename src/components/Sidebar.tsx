import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdPets } from "react-icons/md";
import {
  HouseDoorFill,
  PersonFill,
  JournalMedical,
  Calendar2EventFill,
  Clipboard2Plus,
  Receipt,
  PeopleFill,
  Capsule,
} from 'react-bootstrap-icons';

const Sidebar: React.FC = () => {
  return (
    <aside 
      className="sidebar p-3" 
      style={{ 
        width: 240,
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000
      }}
    >
      <h5 className="fw-bold mb-4 text-white">
        <MdPets className="me-2" />
        Patitas
      </h5>

      <nav className="nav flex-column">
        <NavLink to="/" className="nav-link d-flex align-items-center py-2" end>
          <HouseDoorFill className="me-2" /> Inicio
        </NavLink>

        <NavLink
          to="/clientes"
          className="nav-link d-flex align-items-center py-2"
        >
          <PersonFill className="me-2" /> Clientes
        </NavLink>

        <NavLink
          to="/mascotas"
          className="nav-link d-flex align-items-center py-2"
        >
          <JournalMedical className="me-2" /> Mascotas
        </NavLink>

        <NavLink
          to="/citas"
          className="nav-link d-flex align-items-center py-2"
        >
          <Calendar2EventFill className="me-2" /> Citas
        </NavLink>

        <NavLink
          to="/consultas"
          className="nav-link d-flex align-items-center py-2"
        >
          <Clipboard2Plus className="me-2" /> Consultas
        </NavLink>

        <NavLink
          to="/facturas"
          className="nav-link d-flex align-items-center py-2"
        >
          <Receipt className="me-2" /> Facturación
        </NavLink>

        <NavLink
          to="/gestion-usuarios"
          className="nav-link d-flex align-items-center py-2"
        >
          <PeopleFill className="me-2" /> Usuarios
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
