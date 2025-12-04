import React, { useEffect, useState, useCallback } from "react";
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { useNotifications } from "../../../contexts/NotificationContext";
import "./Toast.css";

// Definir tipos localmente para evitar problemas de importação
type NotificationType = "success" | "error" | "warning" | "info";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
  read?: boolean;
  dismissed?: boolean;
};

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

const icons: Record<NotificationType, React.ReactNode> = {
  success: <FaCheckCircle />,
  error: <FaExclamationCircle />,
  warning: <FaExclamationTriangle />,
  info: <FaInfoCircle />,
};

const getToastClass = (type: NotificationType): string => {
  const baseClass = "toast";
  return `${baseClass} toast--${type}`;
};

export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Tempo da animação de saída
  }, [onClose]);

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 10);

    // Auto-remover após a duração
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, handleClose]);

  return (
    <div
      className={`${getToastClass(notification.type)} ${isVisible ? "toast--visible" : ""} ${isExiting ? "toast--exiting" : ""}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__icon">{icons[notification.type]}</div>
      <div className="toast__content">
        <div className="toast__title">{notification.title}</div>
        {notification.message && (
          <div className="toast__message">{notification.message}</div>
        )}
      </div>
      <button
        type="button"
        className="toast__close"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        aria-label="Fechar notificação"
      >
        <FaTimes size={12} />
      </button>
      {notification.duration && notification.duration > 0 && (
        <div className="toast__progress">
          <div
            className="toast__progress-bar"
            style={{
              animationDuration: `${notification.duration}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
};

