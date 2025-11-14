import React from 'react';
import { Navbar as BsNavbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { MdOutlinePets } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import { IoIosLogOut } from 'react-icons/io';
const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <BsNavbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container fluid className="px-3">
        <BsNavbar.Brand href="#" className="fw-bold text-primary">
          <MdOutlinePets className="me-2" />
          Patitas
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="top-navbar" />
        <BsNavbar.Collapse id="top-navbar">
          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="dropdown-user">
                <FaUserCircle className="me-2" />
                {user?.nombres} {user?.apellidos}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleLogout}>
                  <IoIosLogOut className="me-2" />
                  Cerrar sesión
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
