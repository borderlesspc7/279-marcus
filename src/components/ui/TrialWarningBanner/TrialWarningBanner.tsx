import React from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { useTrial } from "../../../hooks/useTrial";
import "./TrialWarningBanner.css";

export const TrialWarningBanner: React.FC = () => {
  const { shouldShowWarning, daysRemaining, trialEndDate } = useTrial();
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Não mostrar se não deve mostrar aviso ou se foi dispensado
  if (!shouldShowWarning || isDismissed) {
    return null;
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getMessage = () => {
    if (daysRemaining === null) return "";
    
    if (daysRemaining === 0) {
      return "Seu período de trial expira hoje!";
    } else if (daysRemaining === 1) {
      return "Seu período de trial expira amanhã!";
    } else {
      return `Seu período de trial expira em ${daysRemaining} dias`;
    }
  };

  return (
    <div className="trial-warning-banner">
      <div className="trial-warning-banner__content">
        <FaExclamationTriangle className="trial-warning-banner__icon" />
        <div className="trial-warning-banner__text">
          <strong>{getMessage()}</strong>
          {trialEndDate && (
            <span className="trial-warning-banner__date">
              Data de expiração: {formatDate(trialEndDate)}
            </span>
          )}
          <span className="trial-warning-banner__action">
            Para continuar usando todas as funcionalidades, assine um plano.
          </span>
        </div>
        <button
          className="trial-warning-banner__close"
          onClick={() => setIsDismissed(true)}
          aria-label="Fechar aviso"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

