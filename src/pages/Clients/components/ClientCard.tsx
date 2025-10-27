import React from "react";
import { FaEnvelope, FaPhone, FaUser } from "react-icons/fa";
import type { Client } from "../../../types/client";
import "./ClientCard.css";

interface ClientCardProps {
  client: Client;
  onClick: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  return (
    <div className="client-card" onClick={onClick}>
      <div className="client-card__avatar">
        <FaUser size={24} />
      </div>

      <div className="client-card__content">
        <h3 className="client-card__name">{client.fullName}</h3>

        <div className="client-card__info">
          <div className="client-card__info-item">
            <FaEnvelope className="client-card__icon" />
            <span>{client.email}</span>
          </div>

          <div className="client-card__info-item">
            <FaPhone className="client-card__icon" />
            <span>{client.phone}</span>
          </div>
        </div>
      </div>

      <div className="client-card__arrow">
        <span>→</span>
      </div>
    </div>
  );
};
