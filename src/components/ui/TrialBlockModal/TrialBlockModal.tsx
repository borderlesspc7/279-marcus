import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaCreditCard } from "react-icons/fa";
import { Button } from "../Button/Button";
import { useTrial } from "../../../hooks/useTrial";
import { useAuth } from "../../../hooks/useAuth";
import { paths } from "../../../routes/paths";
import "./TrialBlockModal.css";

interface TrialBlockModalProps {
  onClose?: () => void;
}

export const TrialBlockModal: React.FC<TrialBlockModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { daysRemaining, trialEndDate } = useTrial();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleAssinar = () => {
    navigate(paths.subscription);
    if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (user?.uid) {
      // Se o usuário marcou "não mostrar mais", salvar no localStorage (permanente)
      if (dontShowAgain) {
        const dontShowKey = `trial-block-dont-show-${user.uid}`;
        localStorage.setItem(dontShowKey, "true");
      } else {
        // Se apenas fechou sem marcar, salvar no sessionStorage (apenas esta sessão)
        const sessionDismissedKey = `trial-block-dismissed-${user.uid}`;
        sessionStorage.setItem(sessionDismissedKey, "true");
      }
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="trial-block-modal-overlay">
      <div className="trial-block-modal">
        <div className="trial-block-modal__icon">
          <FaLock size={64} />
        </div>
        <h2 className="trial-block-modal__title">
          Período de Trial Ativo
        </h2>
        <p className="trial-block-modal__message">
          Você está no período de trial. As funcionalidades completas estão disponíveis apenas
          para usuários com plano ativo. Durante o trial, você pode explorar o sistema, mas
          algumas funcionalidades podem estar limitadas.
        </p>
        {daysRemaining !== null && daysRemaining > 0 && (
          <div className="trial-block-modal__info">
            <p>
              <strong>Dias restantes do trial:</strong> {daysRemaining} dia{daysRemaining !== 1 ? "s" : ""}
            </p>
            {trialEndDate && (
              <p>
                <strong>Data de expiração:</strong> {formatDate(trialEndDate)}
              </p>
            )}
          </div>
        )}
        <div className="trial-block-modal__dont-show">
          <label className="trial-block-modal__checkbox-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="trial-block-modal__checkbox"
            />
            <span>Não mostrar mais este aviso</span>
          </label>
        </div>
        <div className="trial-block-modal__actions">
          <Button variant="primary" onClick={handleAssinar}>
            <FaCreditCard /> Assinar Plano
          </Button>
          {onClose && (
            <Button variant="secondary" onClick={handleClose}>
              Continuar Explorando
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

