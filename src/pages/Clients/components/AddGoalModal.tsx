import React, { useState } from "react";
import { FaTimes, FaSave, FaSpinner } from "react-icons/fa";
import { Button } from "../../../components/ui/Button/Button";
import InputField from "../../../components/ui/InputField/InputField";
import { createClientGoal } from "../../../services/clientService";
import type { CreateClientGoalData } from "../../../types/client";
import "./AddGoalModal.css";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  nutritionistId: string;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  nutritionistId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [unit, setUnit] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Título do objetivo é obrigatório");
      return;
    }

    try {
      setLoading(true);

      const goalData: CreateClientGoalData = {
        title: title.trim(),
        description: description.trim() || undefined,
        targetValue: targetValue ? parseFloat(targetValue) : undefined,
        currentValue: currentValue ? parseFloat(currentValue) : undefined,
        unit: unit.trim() || undefined,
        targetDate: targetDate ? new Date(targetDate) : undefined,
      };

      await createClientGoal(clientId, nutritionistId, goalData);

      // Limpar formulário
      setTitle("");
      setDescription("");
      setTargetValue("");
      setCurrentValue("");
      setUnit("");
      setTargetDate("");

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao criar objetivo:", err);
      setError("Erro ao criar objetivo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setTitle("");
    setDescription("");
    setTargetValue("");
    setCurrentValue("");
    setUnit("");
    setTargetDate("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="goal-modal-overlay" onClick={handleClose}>
      <div className="goal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="goal-modal__header">
          <h2 className="goal-modal__title">Novo Objetivo</h2>
          <button
            className="goal-modal__close"
            onClick={handleClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="goal-modal__form">
          {error && (
            <div className="goal-modal__error">
              <p>{error}</p>
            </div>
          )}

          <InputField
            label="Título do Objetivo"
            type="text"
            value={title}
            onChange={setTitle}
            placeholder="Ex: Perda de peso, Ganho de massa muscular..."
            required
            disabled={loading}
          />

          <div className="goal-modal__field">
            <label className="goal-modal__label">Descrição</label>
            <textarea
              className="goal-modal__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo em detalhes..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="goal-modal__row">
            <InputField
              label="Valor Atual"
              type="number"
              value={currentValue}
              onChange={setCurrentValue}
              placeholder="Ex: 80"
              step="0.1"
              disabled={loading}
            />
            <InputField
              label="Valor Alvo"
              type="number"
              value={targetValue}
              onChange={setTargetValue}
              placeholder="Ex: 75"
              step="0.1"
              disabled={loading}
            />
            <InputField
              label="Unidade"
              type="text"
              value={unit}
              onChange={setUnit}
              placeholder="Ex: kg, %, cm"
              disabled={loading}
            />
          </div>

          <InputField
            label="Data Prevista"
            type="date"
            value={targetDate}
            onChange={setTargetDate}
            disabled={loading}
          />

          <div className="goal-modal__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="goal-modal__spinner" /> Salvando...
                </>
              ) : (
                <>
                  <FaSave /> Salvar Objetivo
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
