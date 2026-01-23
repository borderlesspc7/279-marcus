import React, { useState, useEffect } from "react";
import { FaTimes, FaSave, FaSpinner, FaClock, FaPlus, FaTrash } from "react-icons/fa";
import { Button } from "../../../components/ui/Button/Button";
import { ServicesManager } from "./ServicesManager";
import { useAuth } from "../../../hooks/useAuth";
import {
  getOrCreateSchedule,
  createOrUpdateSchedule,
} from "../../../services/scheduleService";
import type { User } from "../../../types/user";
import type { DaySchedule, TimeSlot } from "../../../types/schedule";
import "./EditScheduleModal.css";

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
}

type TabType = "schedule" | "services";

const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("schedule");

  // Schedule data
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      loadSchedule();
    }
  }, [isOpen, user]);

  const loadSchedule = async () => {
    if (!user?.uid) return;

    try {
      setLoadingSchedule(true);
      setError(null);
      const schedule = await getOrCreateSchedule(user.uid);
      setDaySchedules(schedule.daySchedules);
    } catch (err) {
      console.error("Erro ao carregar configuração:", err);
      setError("Erro ao carregar configuração. Tente novamente.");
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleToggleDay = (weekday: number) => {
    setDaySchedules((prev) =>
      prev.map((day) =>
        day.weekday === weekday ? { ...day, isActive: !day.isActive } : day
      )
    );
  };

  const handleAddSlot = (weekday: number) => {
    setDaySchedules((prev) =>
      prev.map((day) => {
        if (day.weekday === weekday) {
          const newSlot: TimeSlot = {
            id: `${weekday}-slot-${Date.now()}`,
            startTime: "08:00",
            endTime: "18:00",
          };
          return {
            ...day,
            slots: [...day.slots, newSlot],
          };
        }
        return day;
      })
    );
  };

  const handleRemoveSlot = (weekday: number, slotId: string) => {
    setDaySchedules((prev) =>
      prev.map((day) => {
        if (day.weekday === weekday) {
          return {
            ...day,
            slots: day.slots.filter((slot) => slot.id !== slotId),
          };
        }
        return day;
      })
    );
  };

  const handleSlotChange = (
    weekday: number,
    slotId: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setDaySchedules((prev) =>
      prev.map((day) => {
        if (day.weekday === weekday) {
          return {
            ...day,
            slots: day.slots.map((slot) =>
              slot.id === slotId ? { ...slot, [field]: value } : slot
            ),
          };
        }
        return day;
      })
    );
  };

  const validateSchedule = (): boolean => {
    for (const day of daySchedules) {
      if (day.isActive && day.slots.length === 0) {
        setError(
          `${WEEKDAY_NAMES[day.weekday]} está ativo mas não tem horários definidos`
        );
        return false;
      }

      for (const slot of day.slots) {
        if (slot.startTime >= slot.endTime) {
          setError(
            `Horário inválido em ${WEEKDAY_NAMES[day.weekday]}: o término deve ser após o início`
          );
          return false;
        }
      }

      // Verificar sobreposição de slots no mesmo dia
      for (let i = 0; i < day.slots.length; i++) {
        for (let j = i + 1; j < day.slots.length; j++) {
          const slot1 = day.slots[i];
          const slot2 = day.slots[j];

          if (
            (slot1.startTime >= slot2.startTime &&
              slot1.startTime < slot2.endTime) ||
            (slot1.endTime > slot2.startTime &&
              slot1.endTime <= slot2.endTime) ||
            (slot1.startTime <= slot2.startTime && slot1.endTime >= slot2.endTime)
          ) {
            setError(
              `Horários sobrepostos em ${WEEKDAY_NAMES[day.weekday]}`
            );
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSchedule()) {
      return;
    }

    if (!user?.uid) {
      setError("Usuário não autenticado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createOrUpdateSchedule(user.uid, { daySchedules });
      
      onSuccess(user);
      onClose();
    } catch (err) {
      console.error("Erro ao salvar configuração:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao salvar configuração. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-schedule-modal-overlay" onClick={onClose}>
      <div
        className="edit-schedule-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-schedule-modal__header">
          <h2 className="edit-schedule-modal__title">
            <FaClock /> Configurações da Agenda
          </h2>
          <button
            className="edit-schedule-modal__close"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="edit-schedule-modal__tabs">
          <button
            className={`edit-schedule-modal__tab ${
              activeTab === "schedule" ? "edit-schedule-modal__tab--active" : ""
            }`}
            onClick={() => setActiveTab("schedule")}
            type="button"
          >
            Horários de Trabalho
          </button>
          <button
            className={`edit-schedule-modal__tab ${
              activeTab === "services" ? "edit-schedule-modal__tab--active" : ""
            }`}
            onClick={() => setActiveTab("services")}
            type="button"
          >
            Serviços
          </button>
        </div>

        {error && (
          <div className="edit-schedule-modal__error">
            <p>{error}</p>
          </div>
        )}

        {/* Tab Content */}
        <div className="edit-schedule-modal__content">
          {activeTab === "schedule" && (
            <>
              {loadingSchedule ? (
                <div className="edit-schedule-modal__loading">
                  <FaSpinner className="edit-schedule-modal__spinner" />
                  <p>Carregando configuração...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="edit-schedule-modal__form">
                  <div className="edit-schedule-modal__info">
                    <p>
                      Configure seus horários de trabalho para cada dia da semana.
                      Você pode adicionar múltiplos intervalos por dia (ex: manhã e
                      tarde).
                    </p>
                  </div>

                  <div className="edit-schedule-modal__days">
                    {daySchedules.map((day) => (
                      <div key={day.weekday} className="edit-schedule-modal__day">
                        <div className="edit-schedule-modal__day-header">
                          <label className="edit-schedule-modal__day-label">
                            <input
                              type="checkbox"
                              checked={day.isActive}
                              onChange={() => handleToggleDay(day.weekday)}
                              className="edit-schedule-modal__checkbox"
                            />
                            <span className="edit-schedule-modal__day-name">
                              {WEEKDAY_NAMES[day.weekday]}
                            </span>
                          </label>
                        </div>

                        {day.isActive && (
                          <div className="edit-schedule-modal__slots">
                            {day.slots.map((slot) => (
                              <div
                                key={slot.id}
                                className="edit-schedule-modal__slot"
                              >
                                <input
                                  type="time"
                                  className="edit-schedule-modal__time-input"
                                  value={slot.startTime}
                                  onChange={(e) =>
                                    handleSlotChange(
                                      day.weekday,
                                      slot.id,
                                      "startTime",
                                      e.target.value
                                    )
                                  }
                                  disabled={loading}
                                />
                                <span className="edit-schedule-modal__slot-separator">
                                  até
                                </span>
                                <input
                                  type="time"
                                  className="edit-schedule-modal__time-input"
                                  value={slot.endTime}
                                  onChange={(e) =>
                                    handleSlotChange(
                                      day.weekday,
                                      slot.id,
                                      "endTime",
                                      e.target.value
                                    )
                                  }
                                  disabled={loading}
                                />
                                {day.slots.length > 1 && (
                                  <button
                                    type="button"
                                    className="edit-schedule-modal__remove-slot"
                                    onClick={() =>
                                      handleRemoveSlot(day.weekday, slot.id)
                                    }
                                    disabled={loading}
                                    title="Remover intervalo"
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                              </div>
                            ))}

                            <button
                              type="button"
                              className="edit-schedule-modal__add-slot"
                              onClick={() => handleAddSlot(day.weekday)}
                              disabled={loading}
                            >
                              <FaPlus /> Adicionar intervalo
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="edit-schedule-modal__actions">
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
                          <FaSpinner className="edit-schedule-modal__spinner" />{" "}
                          Salvando...
                        </>
                      ) : (
                        <>
                          <FaSave /> Salvar Configuração
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}

          {activeTab === "services" && <ServicesManager />}
        </div>
      </div>
    </div>
  );
};
