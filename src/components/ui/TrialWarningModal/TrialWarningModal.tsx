import React from "react";
import { FaExclamationTriangle, FaTimes, FaCreditCard } from "react-icons/fa";
import { Button } from "../Button/Button";
import { useTrial } from "../../../hooks/useTrial";
import "./TrialWarningModal.css";

interface TrialWarningModalProps {
  onClose?: () => void;
}

export const TrialWarningModal: React.FC<TrialWarningModalProps> = ({ onClose }) => {
  const { shouldShowWarning, daysRemaining, trialEndDate } = useTrial();
  const [isDismissed, setIsDismissed] = React.useState(() => {
    // Verificar se o modal já foi fechado hoje
    const dismissedKey = `trial-warning-dismissed-${daysRemaining}`;
    return localStorage.getItem(dismissedKey) === "true";
  });

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

  const handleClose = () => {
    setIsDismissed(true);
    // Salvar no localStorage para não mostrar novamente hoje (baseado nos dias restantes)
    if (daysRemaining !== null) {
      const dismissedKey = `trial-warning-dismissed-${daysRemaining}`;
      localStorage.setItem(dismissedKey, "true");
    }
    if (onClose) {
      onClose();
    }
  };

  const handleAssinar = () => {
    // Futuramente, redirecionar para página de assinatura
    handleClose();
  };

  return (
    <div className="trial-warning-modal-overlay" onClick={handleClose}>
      <div className="trial-warning-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="trial-warning-modal__close"
          onClick={handleClose}
          aria-label="Fechar aviso"
        >
          <FaTimes />
        </button>
        
        <div className="trial-warning-modal__icon">
          <FaExclamationTriangle size={64} />
        </div>
        
        <h2 className="trial-warning-modal__title">
          {getMessage()}
        </h2>
        
        <p className="trial-warning-modal__message">
          Para continuar usando todas as funcionalidades do NutriManager após o término do período de trial,
          é necessário assinar um plano.
        </p>
        
        {trialEndDate && (
          <div className="trial-warning-modal__info">
            <p>
              <strong>Data de expiração:</strong> {formatDate(trialEndDate)}
            </p>
            {daysRemaining !== null && daysRemaining > 0 && (
              <p>
                <strong>Dias restantes:</strong> {daysRemaining} dia{daysRemaining !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
        
        <div className="trial-warning-modal__actions">
          <Button variant="primary" onClick={handleAssinar}>
            <FaCreditCard /> Assinar Plano
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};

