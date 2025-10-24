import React from "react";
import { FaBirthdayCake, FaPhone, FaWhatsapp } from "react-icons/fa";
import "./BirthdayCard.css";

interface Birthday {
  id: number;
  name: string;
  age: number;
  phone: string;
  lastVisit: string;
}

export const BirthdayCard: React.FC = () => {
  // Dados mock de aniversariantes
  const birthdays: Birthday[] = [
    {
      id: 1,
      name: "Fernanda Costa",
      age: 28,
      phone: "(11) 98765-4321",
      lastVisit: "15/10/2025",
    },
    {
      id: 2,
      name: "Roberto Lima",
      age: 45,
      phone: "(11) 97654-3210",
      lastVisit: "20/10/2025",
    },
    {
      id: 3,
      name: "Juliana Martins",
      age: 32,
      phone: "(11) 96543-2109",
      lastVisit: "22/10/2025",
    },
  ];

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `Olá ${name}! 🎉 Feliz aniversário! Desejamos um dia maravilhoso e cheio de realizações! 🎂✨`
    );
    const phoneNumber = phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${phoneNumber}?text=${message}`, "_blank");
  };

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
