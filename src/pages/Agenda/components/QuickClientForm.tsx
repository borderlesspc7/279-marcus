import React, { useState } from "react";
import { FaTimes, FaSave, FaSpinner } from "react-icons/fa";
import { Button } from "../../../components/ui/Button/Button";
import { createClient } from "../../../services/clientService";
import { useAuth } from "../../../hooks/useAuth";
import type { Client, CreateClientData } from "../../../types/client";
import "./QuickClientForm.css";

interface QuickClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: Client) => void;
}

export const QuickClientForm: React.FC<QuickClientFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateClientData>({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "feminino",
    height: undefined,
    weight: undefined,
  });

  const [formErrors, setFormErrors] = useState<Partial<CreateClientData>>({});

  const handleInputChange = (
    field: keyof CreateClientData,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CreateClientData> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Nome completo é obrigatório";
    }

    if (!formData.email.trim()) {
      errors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "E-mail inválido";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Telefone é obrigatório";
    }

    if (!formData.birthDate) {
      errors.birthDate = "Data de nascimento é obrigatória";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user?.uid) {
      setError("Usuário não autenticado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const clientId = await createClient(formData, user.uid);
      
      // Buscar o cliente recém-criado para retornar os dados completos
      const newClient: Client = {
        id: clientId,
        ...formData,
        nutritionistId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      onSuccess(newClient);
      onClose();
    } catch (err: unknown) {
      console.error("Erro ao criar cliente:", err);
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "auth/email-already-in-use"
      ) {
        setError("E-mail já está em uso");
      } else {
        setError("Erro ao criar cliente. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "feminino",
      height: undefined,
      weight: undefined,
    });
    setFormErrors({});
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="quick-client-form-overlay" onClick={handleCancel}>
      <div
        className="quick-client-form"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="quick-client-form__header">
          <h3 className="quick-client-form__title">Cadastro Rápido de Cliente</h3>
          <button
            className="quick-client-form__close"
            onClick={handleCancel}
            disabled={loading}
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="quick-client-form__form">
          {error && (
            <div className="quick-client-form__error">
              <p>{error}</p>
            </div>
          )}

          <div className="quick-client-form__info">
            <p>
              Preencha os dados essenciais do cliente. Você poderá adicionar mais
              informações posteriormente.
            </p>
          </div>

          <div className="quick-client-form__field">
            <label className="quick-client-form__label">
              Nome Completo <span className="quick-client-form__required">*</span>
            </label>
            <input
              type="text"
              className={`quick-client-form__input ${
                formErrors.fullName ? "quick-client-form__input--error" : ""
              }`}
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="Ex: João da Silva"
              disabled={loading}
            />
            {formErrors.fullName && (
              <span className="quick-client-form__error-text">
                {formErrors.fullName}
              </span>
            )}
          </div>

          <div className="quick-client-form__field">
            <label className="quick-client-form__label">
              E-mail <span className="quick-client-form__required">*</span>
            </label>
            <input
              type="email"
              className={`quick-client-form__input ${
                formErrors.email ? "quick-client-form__input--error" : ""
              }`}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="exemplo@email.com"
              disabled={loading}
            />
            {formErrors.email && (
              <span className="quick-client-form__error-text">
                {formErrors.email}
              </span>
            )}
          </div>

          <div className="quick-client-form__field">
            <label className="quick-client-form__label">
              Telefone <span className="quick-client-form__required">*</span>
            </label>
            <input
              type="tel"
              className={`quick-client-form__input ${
                formErrors.phone ? "quick-client-form__input--error" : ""
              }`}
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="(11) 99999-9999"
              disabled={loading}
            />
            {formErrors.phone && (
              <span className="quick-client-form__error-text">
                {formErrors.phone}
              </span>
            )}
          </div>

          <div className="quick-client-form__row">
            <div className="quick-client-form__field">
              <label className="quick-client-form__label">
                Data de Nascimento{" "}
                <span className="quick-client-form__required">*</span>
              </label>
              <input
                type="date"
                className={`quick-client-form__input ${
                  formErrors.birthDate ? "quick-client-form__input--error" : ""
                }`}
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                disabled={loading}
              />
              {formErrors.birthDate && (
                <span className="quick-client-form__error-text">
                  {formErrors.birthDate}
                </span>
              )}
            </div>

            <div className="quick-client-form__field">
              <label className="quick-client-form__label">
                Sexo <span className="quick-client-form__required">*</span>
              </label>
              <select
                className="quick-client-form__input"
                value={formData.gender}
                onChange={(e) =>
                  handleInputChange(
                    "gender",
                    e.target.value as "masculino" | "feminino" | "outro"
                  )
                }
                disabled={loading}
              >
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="quick-client-form__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="quick-client-form__spinner" />{" "}
                  Cadastrando...
                </>
              ) : (
                <>
                  <FaSave /> Cadastrar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
