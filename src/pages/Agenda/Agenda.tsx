import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaPlus, FaSpinner, FaClock } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import { AppointmentModal } from "./components/AppointmentModal";
import { EditScheduleModal } from "./components/EditScheduleModal";
import { getAppointmentsByNutritionist } from "../../services/appointmentService";
import { getOrCreateSchedule, getMinMaxWorkingHours } from "../../services/scheduleService";
import { useAuth } from "../../hooks/useAuth";
import type { Appointment, CalendarEvent } from "../../types/appointment";
import type { NutritionistSchedule } from "../../types/schedule";
import type { User } from "../../types/user";
import "./Agenda.css";

// Configurar locale para português
moment.locale("pt-br");
const localizer = momentLocalizer(moment);

const messages = {
  allDay: "Dia inteiro",
  previous: "Anterior",
  next: "Próximo",
  today: "Hoje",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Horário",
  event: "Evento",
  noEventsInRange: "Nenhum evento no período selecionado",
  showMore: (total: number) => `+ Ver mais ${total}`,
};

export const Agenda: React.FC = () => {
  const { user, reloadUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [schedule, setSchedule] = useState<NutritionistSchedule | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [initialTime, setInitialTime] = useState<string | undefined>(undefined);

  const loadAppointments = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      setError(null);
      const appointments = await getAppointmentsByNutritionist(user.uid);
      setAppointments(appointments);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      setError("Erro ao carregar agendamentos. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const convertAppointmentsToEvents = useCallback(() => {
    const calendarEvents: CalendarEvent[] = appointments.map((appointment) => {
      const [startHour, startMinute] = appointment.startTime.split(":");
      const [endHour, endMinute] = appointment.endTime.split(":");

      const start = new Date(appointment.date);
      start.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      const end = new Date(appointment.date);
      end.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      return {
        id: appointment.id,
        title: appointment.clientName,
        start,
        end,
        resource: appointment,
      };
    });
    setEvents(calendarEvents);
  }, [appointments]);

  const loadSchedule = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const scheduleData = await getOrCreateSchedule(user.uid);
      setSchedule(scheduleData);
    } catch (err) {
      console.error("Erro ao carregar configuração de horários:", err);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadAppointments();
    loadSchedule();
  }, [loadAppointments, loadSchedule]);

  useEffect(() => {
    convertAppointmentsToEvents();
  }, [convertAppointmentsToEvents]);

  const handleSelectSlot = ({ start }: { start: Date; end: Date }) => {
    setSelectedAppointment(null);
    
    // Extrair data e horário do slot clicado
    const clickedDate = start;
    const clickedTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
    
    setSelectedDate(clickedDate);
    setInitialTime(clickedTime);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedAppointment(event.resource);
    setSelectedDate(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setSelectedDate(undefined);
    setInitialTime(undefined);
  };

  const handleSuccess = () => {
    loadAppointments();
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setSelectedDate(new Date());
    setInitialTime(undefined);
    setIsModalOpen(true);
  };

  const handleEditSchedule = () => {
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSuccess = async (updatedUser: User) => {
    // Atualizar o usuário no contexto com os dados atualizados
    reloadUser(updatedUser);
    // Recarregar configuração de horários
    await loadSchedule();
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const appointment = event.resource;
    let backgroundColor = "#667eea";

    switch (appointment.status) {
      case "completed":
        backgroundColor = "#10b981";
        break;
      case "cancelled":
        backgroundColor = "#ef4444";
        break;
      case "no-show":
        backgroundColor = "#f59e0b";
        break;
      default:
        backgroundColor = "#667eea";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
        fontWeight: "500",
        fontSize: "0.875rem",
      },
    };
  };

  if (loading) {
    return (
      <div className="agenda__loading">
        <FaSpinner className="agenda__spinner" />
        <p> Carregando agenda... </p>
      </div>
    );
  }

  return (
    <div className="agenda">
      <div className="agenda__header">
        <div>
          <h1 className="agenda__title">Agenda de Consultas</h1>
          <p className="agenda__subtitle">
            Gerencie seus agendamentos e compromissos
          </p>
        </div>
        <div className="agenda__header-actions">
          <Button
            variant="secondary"
            onClick={handleEditSchedule}
            className="agenda__schedule-button"
          >
            <FaClock /> Editar Horários
          </Button>
          <Button
            variant="primary"
            onClick={handleNewAppointment}
            className="agenda__add-button"
          >
            <FaPlus /> Novo Agendamento
          </Button>
        </div>
      </div>

      {error && (
        <div className="agenda__error">
          <p>{error}</p>
          <Button variant="secondary" onClick={loadAppointments}>
            Tentar novamente
          </Button>
        </div>
      )}

      <div className="agenda__calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          messages={messages}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          popup
          eventPropGetter={eventStyleGetter}
          style={{ height: "calc(100vh - 250px)", minHeight: "600px" }}
          views={["month", "week", "day", "agenda"]}
          step={30}
          timeslots={2}
          min={
            schedule
              ? (() => {
                  const { minHour } = getMinMaxWorkingHours(schedule);
                  return new Date(0, 0, 0, minHour, 0, 0);
                })()
              : user?.workStartTime
              ? (() => {
                  const [hour, minute] = user.workStartTime.split(":").map(Number);
                  return new Date(0, 0, 0, hour, minute, 0);
                })()
              : new Date(0, 0, 0, 7, 0, 0)
          }
          max={
            schedule
              ? (() => {
                  const { maxHour } = getMinMaxWorkingHours(schedule);
                  return new Date(0, 0, 0, maxHour, 0, 0);
                })()
              : user?.workEndTime
              ? (() => {
                  const [hour, minute] = user.workEndTime.split(":").map(Number);
                  return new Date(0, 0, 0, hour, minute, 0);
                })()
              : new Date(0, 0, 0, 20, 0, 0)
          }
          defaultView="week"
          culture="pt-BR"
        />
      </div>

      <div className="agenda__legend">
        <h3 className="agenda__legend-title">Legenda:</h3>
        <div className="agenda__legend-items">
          <div className="agenda__legend-item">
            <span
              className="agenda__legend-color"
              style={{ backgroundColor: "#667eea" }}
            ></span>
            <span>Agendado</span>
          </div>
          <div className="agenda__legend-item">
            <span
              className="agenda__legend-color"
              style={{ backgroundColor: "#10b981" }}
            ></span>
            <span>Concluído</span>
          </div>
          <div className="agenda__legend-item">
            <span
              className="agenda__legend-color"
              style={{ backgroundColor: "#ef4444" }}
            ></span>
            <span>Cancelado</span>
          </div>
          <div className="agenda__legend-item">
            <span
              className="agenda__legend-color"
              style={{ backgroundColor: "#f59e0b" }}
            ></span>
            <span>Faltou</span>
          </div>
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        appointment={selectedAppointment}
        initialDate={selectedDate}
        initialTime={initialTime}
      />

      <EditScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={handleScheduleSuccess}
      />
    </div>
  );
};
