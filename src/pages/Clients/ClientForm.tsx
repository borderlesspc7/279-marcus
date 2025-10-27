import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaInfoCircle, FaSave, FaSpinner } from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import InputField from "../../components/ui/InputField/InputField";
import { createClient } from "../../services/clientService";
import { useAuth } from "../../hooks/useAuth";
import type { CreateClientData } from "../../types/client";
import "./ClientForm.css";

export const ClientForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateClientData>({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "feminino",
  });

  const [formErrors, setFormErrors] = useState<Partial<CreateClientData>>({});

  const handleInputChange = (field: keyof CreateClientData, value: string) => {
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
      setError("Usuario não autenticado");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createClient(formData, user.uid);
      navigate("/dashboard/clientes");
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
        setError("Erro ao criar cliente");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/clientes");
  };

  return (
    <div className="client-form">
      <div className="client-form__header">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="client-form__back-button"
        >
          <FaArrowLeft /> Voltar
        </Button>
        <div>
          <h1 className="client-form__title">Novo Cliente</h1>
          <p className="client-form__subtitle">
            Preencha os campos abaixo para criar um novo cliente.
          </p>
        </div>
      </div>

      <div className="client-form__container">
        <form onSubmit={handleSubmit} className="client-form__form">
          {error && (
            <div className="client-form__error">
              <p>{error}</p>
            </div>
          )}

          <div className="client-form__section">
            <h2 className="client-form__section-title">Informações Pessoais</h2>

            <InputField
              label="Nome Completo"
              type="text"
              value={formData.fullName}
              onChange={(value) => handleInputChange("fullName", value)}
              placeholder="Ex: João da Silva"
              error={formErrors.fullName}
              required
              disabled={loading}
            />

            <InputField
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
              placeholder="exemplo@email.com"
              error={formErrors.email}
              required
              disabled={loading}
            />

            <InputField
              label="Telefone"
              type="tel"
              value={formData.phone}
              onChange={(value) => handleInputChange("phone", value)}
              placeholder="(11) 99999-9999"
              error={formErrors.phone}
              required
              disabled={loading}
            />

            <div className="client-form__row">
              <InputField
                label="Data de Nascimento"
                type="date"
                value={formData.birthDate}
                onChange={(value) => handleInputChange("birthDate", value)}
                error={formErrors.birthDate}
                required
                disabled={loading}
              />

              <div className="client-form__gender">
                <label className="client-form__label">
                  Sexo <span className="client-form__required">*</span>
                </label>
                <div className="client-form__gender-options">
                  <label className="client-form__radio">
                    <input
                      type="radio"
                      name="gender"
                      value="feminino"
                      checked={formData.gender === "feminino"}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      disabled={loading}
                    />
                    <span>Feminino</span>
                  </label>

                  <label className="client-form__radio">
                    <input
                      type="radio"
                      name="gender"
                      value="masculino"
                      checked={formData.gender === "masculino"}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      disabled={loading}
                    />
                    <span>Masculino</span>
                  </label>

                  <label className="client-form__radio">
                    <input
                      type="radio"
                      name="gender"
                      value="outro"
                      checked={formData.gender === "outro"}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      disabled={loading}
                    />
                    <span>Outro</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="client-form__info">
            <p>
              <FaInfoCircle size={16} /> Ao cadastrar, uma conta de acesso será
              automaticamente criada para o cliente com o e-mail fornecido.
            </p>
          </div>

          <div className="client-form__actions">
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
                  <FaSpinner size={16} className="client-form__spinner" />{" "}
                  Cadastrando...
                </>
              ) : (
                <>
                  <FaSave /> Cadastrar Cliente
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
