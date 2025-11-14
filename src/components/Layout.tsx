import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="d-flex">
      <Sidebar />
      
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar />
        <main
          className="flex-grow-1 p-4"
          style={{ 
            backgroundColor: 'var(--color-light)', 
            overflow: 'auto',
            marginLeft: 240 
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;