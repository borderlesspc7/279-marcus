import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSave,
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
  FaEdit,
  FaArrowLeft,
} from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import InputField from "../../components/ui/InputField/InputField";
import { clientAuthService } from "../../services/clientAuthService";
import { getClientByAuthUid, updateClient } from "../../services/clientService";
import { clientAuth } from "../../lib/clientFirebaseConfig";
import type { Client, CreateClientData } from "../../types/client";
import "./ClientProfile.css";

export const ClientProfile: React.FC = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<Partial<CreateClientData>>({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "feminino",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateClientData, string>>>({});

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      const firebaseUser = clientAuth.currentUser;
      if (!firebaseUser) {
        setError("Usuário não autenticado");
        return;
      }

      const clientData = await getClientByAuthUid(firebaseUser.uid);
      if (!clientData) {
        setError("Cliente não encontrado");
        return;
      }

      setClient(clientData);
      setFormData({
        fullName: clientData.fullName,
        email: clientData.email,
        phone: clientData.phone,
        birthDate: clientData.birthDate,
        gender: clientData.gender,
      });
    } catch (err) {
      console.error("Erro ao carregar dados do cliente:", err);
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

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
    const errors: Partial<Record<keyof CreateClientData, string>> = {};

    if (!formData.fullName?.trim()) {
      errors.fullName = "Nome completo é obrigatório";
    }

    if (!formData.email?.trim()) {
      errors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "E-mail inválido";
    }

    if (!formData.phone?.trim()) {
      errors.phone = "Telefone é obrigatório";
    }

    if (!formData.birthDate) {
      errors.birthDate = "Data de nascimento é obrigatória";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !client) return;

    try {
      setSaving(true);
      setError(null);

      await updateClient(client.id, {
        fullName: formData.fullName!,
        email: formData.email!,
        phone: formData.phone!,
        birthDate: formData.birthDate!,
        gender: formData.gender!,
      });

      // Recarregar dados atualizados
      await loadClientData();
      setIsEditing(false);
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
      setError("Erro ao salvar dados. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (client) {
      setFormData({
        fullName: client.fullName,
        email: client.email,
        phone: client.phone,
        birthDate: client.birthDate,
        gender: client.gender,
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="client-profile__loading">
        <FaSpinner className="client-profile__spinner" />
        <p>Carregando seus dados...</p>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="client-profile__error">
        <h2>{error}</h2>
        <Button variant="primary" onClick={() => navigate("/dashboard")}>
          Voltar para Dashboard
        </Button>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="client-profile">
      <div className="client-profile__header">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="client-profile__back-button"
        >
          <FaArrowLeft /> Voltar
        </Button>
        <div className="client-profile__header-content">
          <h1 className="client-profile__title">Meu Perfil</h1>
          <p className="client-profile__subtitle">
            Gerencie suas informações pessoais
          </p>
        </div>
      </div>

      <div className="client-profile__container">
        {error && (
          <div className="client-profile__error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="client-profile__card">
          <div className="client-profile__card-header">
            <div className="client-profile__avatar">
              <FaUser size={40} />
            </div>
            <div className="client-profile__card-title">
              <h2>Informações Pessoais</h2>
              {!isEditing && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit /> Editar
                </Button>
              )}
            </div>
          </div>

          <div className="client-profile__card-content">
            {isEditing ? (
              <form className="client-profile__form">
                <InputField
                  label="Nome Completo"
                  type="text"
                  value={formData.fullName || ""}
                  onChange={(value) => handleInputChange("fullName", value)}
                  placeholder="Ex: João da Silva"
                  error={formErrors.fullName}
                  required
                  disabled={saving}
                />

                <InputField
                  label="E-mail"
                  type="email"
                  value={formData.email || ""}
                  onChange={(value) => handleInputChange("email", value)}
                  placeholder="exemplo@email.com"
                  error={formErrors.email}
                  required
                  disabled={saving}
                />

                <InputField
                  label="Telefone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(value) => handleInputChange("phone", value)}
                  placeholder="(11) 99999-9999"
                  error={formErrors.phone}
                  required
                  disabled={saving}
                />

                <InputField
                  label="Data de Nascimento"
                  type="date"
                  value={formData.birthDate || ""}
                  onChange={(value) => handleInputChange("birthDate", value)}
                  error={formErrors.birthDate}
                  required
                  disabled={saving}
                />

                <div className="client-profile__gender">
                  <label className="client-profile__label">
                    Sexo <span className="client-profile__required">*</span>
                  </label>
                  <div className="client-profile__gender-options">
                    <label className="client-profile__radio">
                      <input
                        type="radio"
                        name="gender"
                        value="feminino"
                        checked={formData.gender === "feminino"}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        disabled={saving}
                      />
                      <span>Feminino</span>
                    </label>

                    <label className="client-profile__radio">
                      <input
                        type="radio"
                        name="gender"
                        value="masculino"
                        checked={formData.gender === "masculino"}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        disabled={saving}
                      />
                      <span>Masculino</span>
                    </label>

                    <label className="client-profile__radio">
                      <input
                        type="radio"
                        name="gender"
                        value="outro"
                        checked={formData.gender === "outro"}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        disabled={saving}
                      />
                      <span>Outro</span>
                    </label>
                  </div>
                </div>

                <div className="client-profile__form-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="client-profile__spinner" />{" "}
                        Salvando...
                      </>
                    ) : (
                      <>
                        <FaSave /> Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="client-profile__info">
                <div className="client-profile__info-item">
                  <FaUser className="client-profile__info-icon" />
                  <div>
                    <label>Nome Completo</label>
                    <p>{client.fullName}</p>
                  </div>
                </div>

                <div className="client-profile__info-item">
                  <FaEnvelope className="client-profile__info-icon" />
                  <div>
                    <label>E-mail</label>
                    <p>{client.email}</p>
                  </div>
                </div>

                <div className="client-profile__info-item">
                  <FaPhone className="client-profile__info-icon" />
                  <div>
                    <label>Telefone</label>
                    <p>{client.phone}</p>
                  </div>
                </div>

                <div className="client-profile__info-item">
                  <FaBirthdayCake className="client-profile__info-icon" />
                  <div>
                    <label>Data de Nascimento</label>
                    <p>{formatDate(client.birthDate)}</p>
                  </div>
                </div>

                <div className="client-profile__info-item">
                  <FaVenusMars className="client-profile__info-icon" />
                  <div>
                    <label>Sexo</label>
                    <p style={{ textTransform: "capitalize" }}>
                      {client.gender}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

