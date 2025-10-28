import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaSpinner, FaTrash } from "react-icons/fa";
import { Button } from "../../../components/ui/Button/Button";
import { ClientSearch } from "./ClientSearch";
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../../services/appointmentService";
import { useAuth } from "../../../hooks/useAuth";
import type { Client } from "../../../types/client";
import type { Appointment } from "../../../types/appointment";
import "./AppointmentModal.css";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment?: Appointment | null;
  initialDate?: Date;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  appointment,
  initialDate,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  // Form errors
  const [errors, setErrors] = useState<{
    client?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        // Modo edição
        setSelectedClient({
          id: appointment.clientId,
          fullName: appointment.clientName,
        } as Client);
        setDate(formatDateForInput(appointment.date));
        setStartTime(appointment.startTime);
        setEndTime(appointment.endTime);
        setNotes(appointment.notes || "");
      } else if (initialDate) {
        // Modo criação com data inicial
        setDate(formatDateForInput(initialDate));
      }
    } else {
      // Limpar form ao fechar
      resetForm();
    }
  }, [isOpen, appointment, initialDate]);

  const resetForm = () => {
    setSelectedClient(null);
    setDate("");
    setStartTime("");
    setEndTime("");
    setNotes("");
    setErrors({});
    setError(null);
  };

  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!selectedClient) {
      newErrors.client = "Selecione um cliente";
    }

    if (!date) {
      newErrors.date = "Selecione uma data";
    }

    if (!startTime) {
      newErrors.startTime = "Informe o horário de início";
    }

    if (!endTime) {
      newErrors.endTime = "Informe o horário de término";
    }

    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = "Horário de término deve ser após o início";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user?.uid || !selectedClient) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const appointmentData = {
        clientId: selectedClient.id,
        clientName: selectedClient.fullName,
        date: new Date(date),
        startTime,
        endTime,
        notes,
      };

      if (appointment) {
        // Atualizar agendamento existente
        await updateAppointment(appointment.id, appointmentData);
      } else {
        // Criar novo agendamento
        await createAppointment(appointmentData, user.uid);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Erro ao salvar agendamento:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao salvar agendamento. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;

    if (!confirm("Tem certeza que deseja excluir este agendamento?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteAppointment(appointment.id);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao deletar agendamento:", err);
      setError("Erro ao deletar agendamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="appointment-modal-overlay" onClick={onClose}>
      <div className="appointment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="appointment-modal__header">
          <h2 className="appointment-modal__title">
            {appointment ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>
          <button
            className="appointment-modal__close"
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="appointment-modal__form">
          {error && (
            <div className="appointment-modal__error">
              <p>{error}</p>
            </div>
          )}

          {/* Busca de Cliente */}
          <ClientSearch
            onSelect={setSelectedClient}
            selectedClient={selectedClient}
            error={errors.client}
          />

          {/* Data */}
          <div className="appointment-modal__field">
            <label className="appointment-modal__label">
              Data da Consulta{" "}
              <span className="appointment-modal__required">*</span>
            </label>
            <input
              type="date"
              className={`appointment-modal__input ${
                errors.date ? "appointment-modal__input--error" : ""
              }`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
            {errors.date && (
              <span className="appointment-modal__field-error">
                {errors.date}
              </span>
            )}
          </div>

          {/* Horários */}
          <div className="appointment-modal__row">
            <div className="appointment-modal__field">
              <label className="appointment-modal__label">
                Horário de Início{" "}
                <span className="appointment-modal__required">*</span>
              </label>
              <input
                type="time"
                className={`appointment-modal__input ${
                  errors.startTime ? "appointment-modal__input--error" : ""
                }`}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={loading}
              />
              {errors.startTime && (
                <span className="appointment-modal__field-error">
                  {errors.startTime}
                </span>
              )}
            </div>

            <div className="appointment-modal__field">
              <label className="appointment-modal__label">
                Horário de Término{" "}
                <span className="appointment-modal__required">*</span>
              </label>
              <input
                type="time"
                className={`appointment-modal__input ${
                  errors.endTime ? "appointment-modal__input--error" : ""
                }`}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={loading}
              />
              {errors.endTime && (
                <span className="appointment-modal__field-error">
                  {errors.endTime}
                </span>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="appointment-modal__field">
            <label className="appointment-modal__label">
              Observações (Opcional)
            </label>
            <textarea
              className="appointment-modal__textarea"
              placeholder="Ex: Consulta de retorno, trazer exames, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Ações */}
          <div className="appointment-modal__actions">
            {appointment && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={loading}
              >
                <FaTrash /> Excluir
              </Button>
            )}
            <div className="appointment-modal__actions-right">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner className="appointment-modal__spinner" />{" "}
                    Salvando...
                  </>
                ) : (
                  <>
                    <FaSave /> {appointment ? "Atualizar" : "Agendar"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
