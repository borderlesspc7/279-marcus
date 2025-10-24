import React from "react";
import { FaClock, FaUser, FaPhone } from "react-icons/fa";
import "./ScheduleSummary.css";

interface Appointment {
  id: number;
  time: string;
  client: string;
  phone: string;
  type: string;
  status: "confirmed" | "pending" | "completed";
}

export const ScheduleSummary: React.FC = () => {
  // Dados mock de consultas de hoje
  const appointments: Appointment[] = [
    {
      id: 1,
      time: "09:00",
      client: "Maria Silva",
      phone: "(11) 98765-4321",
      type: "Primeira Consulta",
      status: "confirmed",
    },
    {
      id: 2,
      time: "10:00",
      client: "João Santos",
      phone: "(11) 98765-1234",
      type: "Retorno",
      status: "confirmed",
    },
    {
      id: 3,
      time: "14:00",
      client: "Ana Paula",
      phone: "(11) 97654-3210",
      type: "Avaliação",
      status: "pending",
    },
    {
      id: 4,
      time: "15:00",
      client: "Carlos Oliveira",
      phone: "(11) 96543-2109",
      type: "Retorno",
      status: "confirmed",
    },
  ];

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "completed":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "completed":
        return "Concluído";
      default:
        return status;
    }
  };

  return (
    <div className="schedule-summary">
      <div className="schedule-summary__header">
        <div>
          <p className="schedule-summary__header-label">Consultas Hoje</p>
          <p className="schedule-summary__header-count">
            {appointments.length}
          </p>
        </div>
        <FaClock size={32} style={{ opacity: 0.8 }} />
      </div>

      <div className="schedule-summary__list">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="schedule-summary__appointment">
            <div className="schedule-summary__appointment-header">
              <div className="schedule-summary__appointment-time">
                <FaClock size={14} color="#667eea" />
                <span className="schedule-summary__time-text">
                  {appointment.time}
                </span>
              </div>
              <span
                className="schedule-summary__status-badge"
                style={{
                  background: getStatusColor(appointment.status) + "20",
                  color: getStatusColor(appointment.status),
                }}
              >
                {getStatusText(appointment.status)}
              </span>
            </div>
            <div className="schedule-summary__appointment-row">
              <FaUser size={12} color="#6b7280" />
              <span className="schedule-summary__client-name">
                {appointment.client}
              </span>
            </div>
            <div className="schedule-summary__appointment-row">
              <FaPhone size={12} color="#6b7280" />
              <span className="schedule-summary__phone">
                {appointment.phone}
              </span>
            </div>
            <div className="schedule-summary__appointment-type">
              <span className="schedule-summary__type-text">
                {appointment.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
