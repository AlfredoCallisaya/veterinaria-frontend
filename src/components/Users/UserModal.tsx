// src/components/Users/UserModal.tsx
import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const UserModal: React.FC<Props> = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default UserModal;
