import React, { useEffect } from "react";
import "./Modal.css";
import { CheckCircle, AlertCircle } from "lucide-react";

const Modal = ({ message, onClose, onConfirm, type = "alert", variant = "success" }) => {
  const isPrompt = type === "prompt";

  useEffect(() => {
    if (!isPrompt) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPrompt, onClose]);

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose(); // close after action
  };

  const Icon = variant === "success" ? CheckCircle : AlertCircle;

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${variant}`}>
        <Icon className="modal-icon" />
        <p>{message}</p>
        {isPrompt && (
          <button className="modal-close" onClick={handleConfirm}>OK</button>
        )}
      </div>
    </div>
  );
};

export default Modal;
