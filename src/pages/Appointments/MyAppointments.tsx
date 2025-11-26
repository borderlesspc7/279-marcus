import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { getAppointmentsByClientAuthUid } from "../../services/appointmentService";
import type { Appointment } from "../../types/appointment";
import "./MyAppointments.css";

export const MyAppointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const data = await getAppointmentsByClientAuthUid(user.uid);
        setAppointments(data);
      } catch (error) {
        console.error("Erro ao carregar consultas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [user?.uid]);

  const getStatusInfo = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return {
          icon: <FaHourglassHalf />,
          text: "Aguardando Aprovação",
          color: "#f59e0b",
          bgColor: "#fef3c7",
        };
      case "scheduled":
        return {
          icon: <FaCheckCircle />,
          text: "Confirmado",
          color: "#10b981",
          bgColor: "#d1fae5",
        };
      case "completed":
        return {
          icon: <FaCheckCircle />,
          text: "Concluído",
          color: "#6b7280",
          bgColor: "#f3f4f6",
        };
      case "rejected":
        return {
          icon: <FaTimesCircle />,
          text: "Rejeitado",
          color: "#ef4444",
          bgColor: "#fee2e2",
        };
      case "cancelled":
        return {
          icon: <FaTimesCircle />,
          text: "Cancelado",
          color: "#ef4444",
          bgColor: "#fee2e2",
        };
      default:
        return {
          icon: <FaClock />,
          text: status,
          color: "#6b7280",
          bgColor: "#f3f4f6",
        };
    }
  };

  if (loading) {
    return (
      <div className="my-appointments">
        <div className="my-appointments__loading">
          <FaClock className="fa-spin" size={24} />
          <p>Carregando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-appointments">
      <div className="my-appointments__header">
        <h1 className="my-appointments__title">Minhas Consultas</h1>
        <p className="my-appointments__subtitle">
          Acompanhe o status das suas solicitações de consulta
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="my-appointments__empty">
          <FaCalendarAlt size={48} />
          <p>Você ainda não possui consultas agendadas</p>
        </div>
      ) : (
        <div className="my-appointments__list">
          {appointments.map((appointment) => {
            const statusInfo = getStatusInfo(appointment.status);
            const appointmentDate = new Date(appointment.date);

            return (
              <div key={appointment.id} className="my-appointments__card">
                <div className="my-appointments__card-header">
                  <div className="my-appointments__date">
                    <FaCalendarAlt />
                    <span>
                      {appointmentDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div
                    className="my-appointments__status"
                    style={{
                      color: statusInfo.color,
                      backgroundColor: statusInfo.bgColor,
                    }}
                  >
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                  </div>
                </div>

                <div className="my-appointments__card-body">
                  <div className="my-appointments__time">
                    <FaClock />
                    <span>
                      {appointment.startTime.substring(0, 5)} -{" "}
                      {appointment.endTime.substring(0, 5)}
                    </span>
                  </div>

                  {appointment.notes && (
                    <div className="my-appointments__notes">
                      <p>
                        <strong>Observações:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

