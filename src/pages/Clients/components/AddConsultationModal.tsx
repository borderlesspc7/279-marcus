import React, { useState } from "react";
import { FaTimes, FaSave, FaSpinner } from "react-icons/fa";
import { Button } from "../../../components/ui/Button/Button";
import InputField from "../../../components/ui/InputField/InputField";
import { createConsultation } from "../../../services/clientService";
import type { CreateConsultationData } from "../../../types/client";
import "./AddConsultationModal.css";

interface AddConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  nutritionistId: string;
}

export const AddConsultationModal: React.FC<AddConsultationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  nutritionistId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [complaints, setComplaints] = useState("");
  const [observations, setObservations] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Data da consulta é obrigatória");
      return;
    }

    try {
      setLoading(true);

      const consultationData: CreateConsultationData = {
        date: new Date(date),
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
        complaints: complaints.trim() || undefined,
        observations: observations.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await createConsultation(clientId, nutritionistId, consultationData);

      // Limpar formulário
      setDate(new Date().toISOString().split("T")[0]);
      setWeight("");
      setHeight("");
      setBodyFat("");
      setMuscleMass("");
      setComplaints("");
      setObservations("");
      setNotes("");

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao criar consulta:", err);
      setError("Erro ao criar consulta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setDate(new Date().toISOString().split("T")[0]);
    setWeight("");
    setHeight("");
    setBodyFat("");
    setMuscleMass("");
    setComplaints("");
    setObservations("");
    setNotes("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="consultation-modal-overlay" onClick={handleClose}>
      <div className="consultation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="consultation-modal__header">
          <h2 className="consultation-modal__title">Nova Consulta</h2>
          <button
            className="consultation-modal__close"
            onClick={handleClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="consultation-modal__form">
          {error && (
            <div className="consultation-modal__error">
              <p>{error}</p>
            </div>
          )}

          <InputField
            label="Data da Consulta"
            type="date"
            value={date}
            onChange={setDate}
            required
            disabled={loading}
          />

          <div className="consultation-modal__row">
            <InputField
              label="Peso (kg)"
              type="number"
              value={weight}
              onChange={setWeight}
              placeholder="Ex: 70.5"
              step="0.1"
              disabled={loading}
            />
            <InputField
              label="Altura (cm)"
              type="number"
              value={height}
              onChange={setHeight}
              placeholder="Ex: 175"
              step="0.1"
              disabled={loading}
            />
          </div>

          <div className="consultation-modal__row">
            <InputField
              label="Gordura Corporal (%)"
              type="number"
              value={bodyFat}
              onChange={setBodyFat}
              placeholder="Ex: 20.5"
              step="0.1"
              disabled={loading}
            />
            <InputField
              label="Massa Muscular (kg)"
              type="number"
              value={muscleMass}
              onChange={setMuscleMass}
              placeholder="Ex: 50.0"
              step="0.1"
              disabled={loading}
            />
          </div>

          <div className="consultation-modal__field">
            <label className="consultation-modal__label">Queixas do Paciente</label>
            <textarea
              className="consultation-modal__textarea"
              value={complaints}
              onChange={(e) => setComplaints(e.target.value)}
              placeholder="Descreva as queixas do paciente..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="consultation-modal__field">
            <label className="consultation-modal__label">Observações</label>
            <textarea
              className="consultation-modal__textarea"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações do nutricionista..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="consultation-modal__field">
            <label className="consultation-modal__label">Anotações</label>
            <textarea
              className="consultation-modal__textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotações adicionais..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="consultation-modal__actions">
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
                  <FaSpinner className="consultation-modal__spinner" /> Salvando...
                </>
              ) : (
                <>
                  <FaSave /> Salvar Consulta
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
