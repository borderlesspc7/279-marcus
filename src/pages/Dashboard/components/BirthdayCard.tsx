import React, { useEffect, useState } from "react";
import { FaBirthdayCake, FaPhone, FaWhatsapp, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";
import { getClientsByNutritionist } from "../../../services/clientService";
import { getAppointmentsByClient } from "../../../services/appointmentService";
import type { Client } from "../../../types/client";
import "./BirthdayCard.css";

interface Birthday {
  id: string;
  name: string;
  age: number;
  phone: string;
  lastVisit: string;
}

export const BirthdayCard: React.FC = () => {
  const { user } = useAuth();
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBirthdays = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const clients = await getClientsByNutritionist(user.uid);
        const today = new Date();
        const todayMonth = today.getMonth() + 1; // getMonth retorna 0-11
        const todayDay = today.getDate();

        // Filtrar clientes que fazem aniversário hoje
        const todayBirthdays = await Promise.all(
          clients
            .filter((client) => {
              if (!client.birthDate) return false;
              const birthDate = new Date(client.birthDate);
              return (
                birthDate.getMonth() + 1 === todayMonth &&
                birthDate.getDate() === todayDay
              );
            })
            .map(async (client) => {
              // Buscar última consulta
              let lastVisit = "Nunca";
              try {
                const appointments = await getAppointmentsByClient(client.id);
                if (appointments.length > 0) {
                  // Ordenar por data e pegar a mais recente
                  appointments.sort(
                    (a, b) => b.date.getTime() - a.date.getTime()
                  );
                  const lastAppointment = appointments[0];
                  lastVisit = lastAppointment.date.toLocaleDateString("pt-BR");
                }
              } catch (error) {
                console.error(
                  `Erro ao buscar consultas do cliente ${client.id}:`,
                  error
                );
              }

              // Calcular idade
              const birthDate = new Date(client.birthDate);
              const age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              const dayDiff = today.getDate() - birthDate.getDate();
              const actualAge =
                monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)
                  ? age - 1
                  : age;

              return {
                id: client.id,
                name: client.fullName,
                age: actualAge,
                phone: client.phone,
                lastVisit,
              };
            })
        );

        setBirthdays(todayBirthdays);
      } catch (error) {
        console.error("Erro ao carregar aniversariantes:", error);
        setBirthdays([]);
      } finally {
        setLoading(false);
      }
    };

    loadBirthdays();
  }, [user?.uid]);

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `Olá ${name}! 🎉 Feliz aniversário! Desejamos um dia maravilhoso e cheio de realizações! 🎂✨`
    );
    const phoneNumber = phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${phoneNumber}?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="birthday-card">
        <div className="birthday-card__loading">
          <FaSpinner className="fa-spin" size={24} />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (birthdays.length === 0) {
    return (
      <div className="birthday-card__empty">
        <FaBirthdayCake size={48} className="birthday-card__empty-icon" />
        <p className="birthday-card__empty-text">Nenhum aniversariante hoje</p>
      </div>
    );
  }

  return (
    <div className="birthday-card">
      <div className="birthday-card__header">
        <FaBirthdayCake size={32} className="birthday-card__header-icon" />
        <p className="birthday-card__header-label">Aniversariantes Hoje</p>
        <p className="birthday-card__header-count">{birthdays.length}</p>
      </div>

      <div className="birthday-card__list">
        {birthdays.map((birthday) => (
          <div key={birthday.id} className="birthday-card__item">
            <div className="birthday-card__decoration">🎉</div>
            <div className="birthday-card__item-header">
              <div>
                <h3 className="birthday-card__name">{birthday.name}</h3>
                <p className="birthday-card__age">{birthday.age} anos</p>
              </div>
              <FaBirthdayCake size={24} color="#f59e0b" />
            </div>
            <div className="birthday-card__phone-row">
              <FaPhone size={12} color="#b45309" />
              <span className="birthday-card__phone">{birthday.phone}</span>
            </div>
            <div className="birthday-card__last-visit">
              Última consulta: {birthday.lastVisit}
            </div>
            <button
              onClick={() => handleWhatsApp(birthday.phone, birthday.name)}
              className="birthday-card__whatsapp-btn"
            >
              <FaWhatsapp size={16} />
              Enviar Mensagem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
