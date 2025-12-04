import React from "react";
import { useNotifications } from "../../../contexts/NotificationContext";
import { Toast } from "./Toast";
import "./ToastContainer.css";

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useNotifications();

  // Mostrar apenas os toasts que não foram fechados (não dismissed)
  const visibleToasts = notifications.filter((n) => !n.dismissed).slice(0, 5);

  if (visibleToasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {visibleToasts.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
};

