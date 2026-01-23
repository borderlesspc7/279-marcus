import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaSpinner,
  FaFilePdf,
  FaDownload,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
  FaExclamationTriangle,
  FaStickyNote,
  FaFileAlt,
  FaUtensils,
  FaEye,
  FaCalendarCheck,
  FaBullseye,
  FaChartLine,
} from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import InputField from "../../components/ui/InputField/InputField";
import {
  getClientById,
  getClientNotes,
  addClientNote,
  updateClientNote,
  deleteClientNote,
  getClientDocuments,
  deleteClientDocument,
  updateClient,
  deleteClient,
  getConsultationsByClient,
  getConsultationCount,
  getClientGoals,
} from "../../services/clientService";
import { getDietsByClient, deleteDiet } from "../../services/dietService";
import type { Client, ClientNote, ClientDocument, Consultation, ClientGoal } from "../../types/client";
import type { Diet } from "../../types/food";
import { AddDocumentModal } from "./components/AddDocumentModal";
import { AddConsultationModal } from "./components/AddConsultationModal";
import { AddGoalModal } from "./components/AddGoalModal";
import { useAuth } from "../../hooks/useAuth";
import "./ClientProfile.css";

export const ClientProfile: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [diets, setDiets] = useState<Diet[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [returnCount, setReturnCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para nova nota
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Estados para edição de nota
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  // Estado para modais
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Estados para edição de informações pessoais
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editingFullName, setEditingFullName] = useState<string>("");
  const [editingEmail, setEditingEmail] = useState<string>("");
  const [editingPhone, setEditingPhone] = useState<string>("");
  const [editingBirthDate, setEditingBirthDate] = useState<string>("");
  const [editingGender, setEditingGender] = useState<"masculino" | "feminino" | "outro">("masculino");
  const [updatingInfo, setUpdatingInfo] = useState(false);
  const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});

  // Estados para edição de altura e peso
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [editingHeight, setEditingHeight] = useState<string>("");
  const [editingWeight, setEditingWeight] = useState<string>("");
  const [updatingMeasurements, setUpdatingMeasurements] = useState(false);

  const loadClientData = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      const [clientData, notesData, documentsData, dietsData, consultationsData, goalsData, returnCountData] = await Promise.all([
        getClientById(clientId),
        getClientNotes(clientId),
        getClientDocuments(clientId),
        getDietsByClient(clientId),
        getConsultationsByClient(clientId),
        getClientGoals(clientId),
        getConsultationCount(clientId),
      ]);

      if (!clientData) {
        setError("Cliente não encontrado");
        return;
      }

      setClient(clientData);
      setNotes(notesData);
      setDocuments(documentsData);
      setDiets(dietsData);
      setConsultations(consultationsData);
      setGoals(goalsData);
      setReturnCount(returnCountData);
    } catch (err) {
      console.error("Erro ao carregar dados do cliente:", err);
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  useEffect(() => {
    if (client) {
      setEditingHeight(client.height?.toString() || "");
      setEditingWeight(client.weight?.toString() || "");
      setEditingFullName(client.fullName);
      setEditingEmail(client.email);
      setEditingPhone(client.phone);
      setEditingBirthDate(client.birthDate);
      setEditingGender(client.gender);
    }
  }, [client]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !clientId) return;

    try {
      setAddingNote(true);
      await addClientNote(clientId, newNote);
      setNewNote("");

      // Recarrega as notas
      const notesData = await getClientNotes(clientId);
      setNotes(notesData);
    } catch (err) {
      console.error("Erro ao adicionar nota:", err);
      alert("Erro ao adicionar nota");
    } finally {
      setAddingNote(false);
    }
  };

  const handleStartEditNote = (note: ClientNote) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  const handleSaveEditNote = async () => {
    if (!editingNoteId || !editingNoteContent.trim() || !clientId) return;

    try {
      await updateClientNote(editingNoteId, editingNoteContent);
      setEditingNoteId(null);
      setEditingNoteContent("");

      // Recarrega as notas
      const notesData = await getClientNotes(clientId);
      setNotes(notesData);
    } catch (err) {
      console.error("Erro ao atualizar nota:", err);
      alert("Erro ao atualizar nota");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta nota?")) return;
    if (!clientId) return;

    try {
      await deleteClientNote(noteId);

      // Recarrega as notas
      const notesData = await getClientNotes(clientId);
      setNotes(notesData);
    } catch (err) {
      console.error("Erro ao deletar nota:", err);
      alert("Erro ao deletar nota");
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Tem certeza que deseja deletar este documento?")) return;
    if (!clientId) return;

    try {
      await deleteClientDocument(docId);

      // Recarrega os documentos
      const documentsData = await getClientDocuments(clientId);
      setDocuments(documentsData);
    } catch (err) {
      console.error("Erro ao deletar documento:", err);
      alert("Erro ao deletar documento");
    }
  };

  const handleDocumentAdded = async () => {
    if (!clientId) return;
    // Recarrega os documentos
    const documentsData = await getClientDocuments(clientId);
    setDocuments(documentsData);
  };

  const handleConsultationAdded = async () => {
    if (!clientId) return;
    // Recarrega as consultas e contagem de retornos
    const [consultationsData, returnCountData] = await Promise.all([
      getConsultationsByClient(clientId),
      getConsultationCount(clientId),
    ]);
    setConsultations(consultationsData);
    setReturnCount(returnCountData);
  };

  const handleGoalAdded = async () => {
    if (!clientId) return;
    // Recarrega os objetivos
    const goalsData = await getClientGoals(clientId);
    setGoals(goalsData);
  };

  const handleStartEditMeasurements = () => {
    if (client) {
      setEditingHeight(client.height?.toString() || "");
      setEditingWeight(client.weight?.toString() || "");
      setIsEditingMeasurements(true);
    }
  };

  const handleSaveMeasurements = async () => {
    if (!clientId || !client) return;

    try {
      setUpdatingMeasurements(true);
      await updateClient(clientId, {
        height: editingHeight ? parseFloat(editingHeight) : undefined,
        weight: editingWeight ? parseFloat(editingWeight) : undefined,
      });

      // Recarrega os dados do cliente
      await loadClientData();
      setIsEditingMeasurements(false);
    } catch (err) {
      console.error("Erro ao atualizar medidas:", err);
      alert("Erro ao atualizar medidas");
    } finally {
      setUpdatingMeasurements(false);
    }
  };

  const handleCancelEditMeasurements = () => {
    if (client) {
      setEditingHeight(client.height?.toString() || "");
      setEditingWeight(client.weight?.toString() || "");
    }
    setIsEditingMeasurements(false);
  };

  const handleStartEditInfo = () => {
    if (client) {
      setEditingFullName(client.fullName);
      setEditingEmail(client.email);
      setEditingPhone(client.phone);
      setEditingBirthDate(client.birthDate);
      setEditingGender(client.gender);
      setInfoErrors({});
      setIsEditingInfo(true);
    }
  };

  const validateInfo = (): boolean => {
    const errors: Record<string, string> = {};

    if (!editingFullName.trim()) {
      errors.fullName = "Nome completo é obrigatório";
    }

    if (!editingEmail.trim()) {
      errors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingEmail)) {
      errors.email = "E-mail inválido";
    }

    if (!editingPhone.trim()) {
      errors.phone = "Telefone é obrigatório";
    }

    if (!editingBirthDate) {
      errors.birthDate = "Data de nascimento é obrigatória";
    }

    setInfoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveInfo = async () => {
    if (!clientId || !client) return;
    if (!validateInfo()) return;

    try {
      setUpdatingInfo(true);
      await updateClient(clientId, {
        fullName: editingFullName,
        email: editingEmail,
        phone: editingPhone,
        birthDate: editingBirthDate,
        gender: editingGender,
      });

      // Recarrega os dados do cliente
      await loadClientData();
      setIsEditingInfo(false);
    } catch (err) {
      console.error("Erro ao atualizar informações:", err);
      alert("Erro ao atualizar informações");
    } finally {
      setUpdatingInfo(false);
    }
  };

  const handleCancelEditInfo = () => {
    if (client) {
      setEditingFullName(client.fullName);
      setEditingEmail(client.email);
      setEditingPhone(client.phone);
      setEditingBirthDate(client.birthDate);
      setEditingGender(client.gender);
    }
    setInfoErrors({});
    setIsEditingInfo(false);
  };

  const handleDeleteClient = async () => {
    if (!clientId || !client) return;

    const confirmMessage = `Tem certeza que deseja deletar o paciente "${client.fullName}"?\n\nEsta ação não pode ser desfeita e todos os dados relacionados serão perdidos.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteClient(clientId);
      // Redirecionar para a lista de clientes após deletar
      navigate("/dashboard/clientes");
    } catch (err) {
      console.error("Erro ao deletar paciente:", err);
      alert("Erro ao deletar paciente. Tente novamente.");
    }
  };

  const handleDeleteDiet = async (dietId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta dieta?")) return;
    if (!clientId) return;

    try {
      await deleteDiet(dietId);
      // Recarrega as dietas
      const dietsData = await getDietsByClient(clientId);
      setDiets(dietsData);
    } catch (err) {
      console.error("Erro ao deletar dieta:", err);
      alert("Erro ao deletar dieta");
    }
  };

  const calculateTotalNutrition = (diet: Diet) => {
    return diet.meals.reduce(
      (totals, meal) => {
        const mealTotals = meal.foods.reduce(
          (mealTotal, mealFood) => {
            const multiplier =
              mealFood.unit === "unidades" && mealFood.food.unitWeight
                ? (mealFood.quantity * mealFood.food.unitWeight) / 100
                : mealFood.quantity / 100;

            return {
              calories: mealTotal.calories + mealFood.food.calories * multiplier,
              protein: mealTotal.protein + mealFood.food.protein * multiplier,
              carbs: mealTotal.carbs + mealFood.food.carbs * multiplier,
              fat: mealTotal.fat + mealFood.food.fat * multiplier,
            };
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        return {
          calories: totals.calories + mealTotals.calories,
          protein: totals.protein + mealTotals.protein,
          carbs: totals.carbs + mealTotals.carbs,
          fat: totals.fat + mealTotals.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatPhone = (value: string): string => {
    if (!value) return "";
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return cleaned.slice(0, 15);
  };

  if (loading) {
    return (
      <div className="client-profile__loading">
        <FaSpinner className="client-profile__spinner" />
        <p>Carregando dados do cliente...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="client-profile__error">
        <FaExclamationTriangle
          size={48}
          style={{ color: "#ef4444", marginBottom: "1rem" }}
        />
        <h2>{error || "Cliente não encontrado"}</h2>
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard/clientes")}
        >
          Voltar para Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="client-profile">
      <div className="client-profile__header">
        <button
          className="client-profile__back-button"
          onClick={() => {
            if (isEditingInfo) {
              handleCancelEditInfo();
            } else {
              navigate("/dashboard/clientes");
            }
          }}
        >
          <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1024 1024">
            <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
          </svg>
          <span>Voltar</span>
        </button>
      </div>

      {/* Card de Informações do Cliente */}
      <div className="client-profile__info-card">
        <div className="client-profile__avatar">
          <FaUser size={40} />
        </div>
        <div className="client-profile__info">
          <div className="client-profile__info-header">
            {!isEditingInfo ? (
              <>
                <h1 className="client-profile__name">{client.fullName}</h1>
                <div className="client-profile__header-actions">
                  <button
                    className="client-profile__edit-button"
                    onClick={handleStartEditInfo}
                  >
                    Editar
                    <svg className="client-profile__edit-svg" viewBox="0 0 512 512">
                      <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
                    </svg>
                  </button>
                  <button
                    className="client-profile__delete-button"
                    onClick={handleDeleteClient}
                    title="Deletar paciente"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 69 14"
                      className="client-profile__delete-icon client-profile__bin-top"
                    >
                      <g clipPath="url(#clip0_35_24)">
                        <path
                          fill="black"
                          d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
                        ></path>
                      </g>
                      <defs>
                        <clipPath id="clip0_35_24">
                          <rect fill="white" height="14" width="69"></rect>
                        </clipPath>
                      </defs>
                    </svg>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 69 57"
                      className="client-profile__delete-icon client-profile__bin-bottom"
                    >
                      <g clipPath="url(#clip0_35_22)">
                        <path
                          fill="black"
                          d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                        ></path>
                      </g>
                      <defs>
                        <clipPath id="clip0_35_22">
                          <rect fill="white" height="57" width="69"></rect>
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <h1 className="client-profile__name">Editar Informações</h1>
            )}
          </div>

          {isEditingInfo ? (
            <div className="client-profile__edit-form">
              <InputField
                label="Nome Completo"
                type="text"
                value={editingFullName}
                onChange={setEditingFullName}
                placeholder="Ex: João da Silva"
                error={infoErrors.fullName}
                required
                disabled={updatingInfo}
              />

              <InputField
                label="E-mail"
                type="email"
                value={editingEmail}
                onChange={setEditingEmail}
                placeholder="exemplo@email.com"
                error={infoErrors.email}
                required
                disabled={updatingInfo}
              />

              <InputField
                label="Telefone"
                type="tel"
                value={formatPhone(editingPhone)}
                onChange={(value) => {
                  const cleaned = value.replace(/\D/g, "");
                  setEditingPhone(cleaned);
                }}
                placeholder="(11) 99999-9999"
                error={infoErrors.phone}
                required
                disabled={updatingInfo}
              />

              <InputField
                label="Data de Nascimento"
                type="date"
                value={editingBirthDate}
                onChange={setEditingBirthDate}
                error={infoErrors.birthDate}
                required
                disabled={updatingInfo}
              />

              <div className="client-profile__gender-edit">
                <label className="client-profile__label">
                  Sexo <span className="client-profile__required">*</span>
                </label>
                <div className="client-profile__gender-options">
                  <label className="client-profile__radio">
                    <input
                      type="radio"
                      name="gender"
                      value="feminino"
                      checked={editingGender === "feminino"}
                      onChange={(e) =>
                        setEditingGender(e.target.value as "feminino" | "masculino" | "outro")
                      }
                      disabled={updatingInfo}
                    />
                    <span>Feminino</span>
                  </label>

                  <label className="client-profile__radio">
                    <input
                      type="radio"
                      name="gender"
                      value="masculino"
                      checked={editingGender === "masculino"}
                      onChange={(e) =>
                        setEditingGender(e.target.value as "feminino" | "masculino" | "outro")
                      }
                      disabled={updatingInfo}
                    />
                    <span>Masculino</span>
                  </label>

                  <label className="client-profile__radio">
                    <input
                      type="radio"
                      name="gender"
                      value="outro"
                      checked={editingGender === "outro"}
                      onChange={(e) =>
                        setEditingGender(e.target.value as "feminino" | "masculino" | "outro")
                      }
                      disabled={updatingInfo}
                    />
                    <span>Outro</span>
                  </label>
                </div>
              </div>

              <div className="client-profile__form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={handleCancelEditInfo}
                  disabled={updatingInfo}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="small"
                  onClick={handleSaveInfo}
                  disabled={updatingInfo}
                >
                  {updatingInfo ? (
                    <>
                      <FaSpinner className="client-profile__spinner" /> Salvando...
                    </>
                  ) : (
                    <>
                      <FaSave /> Salvar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="client-profile__details">
              <div className="client-profile__detail-item">
                <FaEnvelope className="client-profile__icon" />
                <span>{client.email}</span>
              </div>

              <div className="client-profile__detail-item">
                <FaPhone className="client-profile__icon" />
                <span>{formatPhone(client.phone)}</span>
              </div>

              <div className="client-profile__detail-item">
                <FaBirthdayCake className="client-profile__icon" />
                <span>
                  {formatDate(new Date(client.birthDate))} (
                  {calculateAge(client.birthDate)} anos)
                </span>
              </div>

              <div className="client-profile__detail-item">
                <FaVenusMars className="client-profile__icon" />
                <span style={{ textTransform: "capitalize" }}>
                  {client.gender}
                </span>
              </div>

              {(client.height || client.weight) && (
                <>
                  {client.height && (
                    <div className="client-profile__detail-item">
                      <span className="client-profile__icon">📏</span>
                      <span>{client.height} cm</span>
                    </div>
                  )}
                  {client.weight && (
                    <div className="client-profile__detail-item">
                      <span className="client-profile__icon">⚖️</span>
                      <span>{client.weight} kg</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Edição de Altura e Peso */}
          <div className="client-profile__measurements">
            <div className="client-profile__measurements-header">
              <h3 className="client-profile__measurements-title">
                Medidas Corporais
              </h3>
              {!isEditingMeasurements && (
                <Button
                  variant={client.height || client.weight ? "secondary" : "primary"}
                  size="small"
                  onClick={handleStartEditMeasurements}
                >
                  {client.height || client.weight ? (
                    <>
                      <FaEdit /> Editar
                    </>
                  ) : (
                    <>
                      <FaPlus /> Adicionar Medidas Corporais
                    </>
                  )}
                </Button>
              )}
            </div>

            {isEditingMeasurements ? (
              <div className="client-profile__measurements-edit">
                <div className="client-profile__measurements-row">
                  <div className="client-profile__measurements-field">
                    <label className="client-profile__measurements-label">
                      Altura (cm)
                    </label>
                    <input
                      type="number"
                      className="client-profile__measurements-input"
                      value={editingHeight}
                      onChange={(e) => setEditingHeight(e.target.value)}
                      placeholder="Ex: 175"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="client-profile__measurements-field">
                    <label className="client-profile__measurements-label">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      className="client-profile__measurements-input"
                      value={editingWeight}
                      onChange={(e) => setEditingWeight(e.target.value)}
                      placeholder="Ex: 70.5"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="client-profile__measurements-actions">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleCancelEditMeasurements}
                    disabled={updatingMeasurements}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleSaveMeasurements}
                    disabled={updatingMeasurements}
                  >
                    {updatingMeasurements ? (
                      <>
                        <FaSpinner className="client-profile__spinner" /> Salvando...
                      </>
                    ) : (
                      <>
                        <FaSave /> Salvar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="client-profile__measurements-display">
                {client.height || client.weight ? (
                  <div className="client-profile__measurements-row">
                    {client.height && (
                      <div className="client-profile__measurements-item">
                        <span className="client-profile__measurements-label">
                          Altura
                        </span>
                        <span className="client-profile__measurements-value">
                          {client.height} cm
                        </span>
                      </div>
                    )}
                    {client.weight && (
                      <div className="client-profile__measurements-item">
                        <span className="client-profile__measurements-label">
                          Peso
                        </span>
                        <span className="client-profile__measurements-value">
                          {client.weight} kg
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="client-profile__measurements-empty">
                    Nenhuma medida cadastrada. Clique em "Editar" para adicionar.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="client-profile__content">
        {/* Seção de Dietas */}
        <div className="client-profile__section client-profile__section--full">
          <div className="client-profile__section-header">
            <h2 className="client-profile__section-title">
              <FaUtensils style={{ marginRight: "0.5rem" }} />
              Dietas
            </h2>
            <Button
              variant="primary"
              size="small"
              onClick={() => navigate(`/dashboard/calculadora?clientId=${clientId}`)}
            >
              <FaPlus /> Criar Nova Dieta
            </Button>
          </div>

          <div className="client-profile__diets-list">
            {diets.length === 0 ? (
              <div className="client-profile__empty">
                <p>Nenhuma dieta criada ainda.</p>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/dashboard/calculadora?clientId=${clientId}`)}
                  className="client-profile__create-diet-btn"
                >
                  <FaPlus /> Criar Primeira Dieta
                </Button>
              </div>
            ) : (
              diets.map((diet) => {
                const totals = calculateTotalNutrition(diet);
                return (
                  <div key={diet.id} className="client-profile__diet-card">
                    <div className="client-profile__diet-header">
                      <div>
                        <h3 className="client-profile__diet-name">{diet.name}</h3>
                        {diet.description && (
                          <p className="client-profile__diet-description">
                            {diet.description}
                          </p>
                        )}
                        <span className="client-profile__diet-date">
                          Criada em: {diet.createdAt.toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="client-profile__diet-actions">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => navigate(`/dashboard/dietas/${diet.id}`)}
                        >
                          <FaEye /> Ver Detalhes
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleDeleteDiet(diet.id)}
                          className="client-profile__diet-delete"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                    <div className="client-profile__diet-nutrition">
                      <div className="client-profile__diet-nutrition-item">
                        <span className="client-profile__diet-nutrition-label">Calorias</span>
                        <span className="client-profile__diet-nutrition-value client-profile__diet-nutrition-value--calories">
                          {totals.calories.toFixed(0)} kcal
                        </span>
                      </div>
                      <div className="client-profile__diet-nutrition-item">
                        <span className="client-profile__diet-nutrition-label">Proteínas</span>
                        <span className="client-profile__diet-nutrition-value">
                          {totals.protein.toFixed(1)}g
                        </span>
                      </div>
                      <div className="client-profile__diet-nutrition-item">
                        <span className="client-profile__diet-nutrition-label">Carboidratos</span>
                        <span className="client-profile__diet-nutrition-value">
                          {totals.carbs.toFixed(1)}g
                        </span>
                      </div>
                      <div className="client-profile__diet-nutrition-item">
                        <span className="client-profile__diet-nutrition-label">Gorduras</span>
                        <span className="client-profile__diet-nutrition-value">
                          {totals.fat.toFixed(1)}g
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Seção de Anotações */}
        <div className="client-profile__section">
          <div className="client-profile__section-header">
            <h2 className="client-profile__section-title">
              <FaStickyNote style={{ marginRight: "0.5rem" }} />
              Histórico de Anotações
            </h2>
          </div>

          {/* Nova Anotação */}
          <div className="client-profile__new-note">
            <textarea
              className="client-profile__textarea"
              placeholder="Adicione uma nova anotação sobre o cliente..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
            <Button
              variant="primary"
              onClick={handleAddNote}
              disabled={!newNote.trim() || addingNote}
            >
              {addingNote ? (
                <>
                  <FaSpinner className="client-profile__spinner" /> Salvando...
                </>
              ) : (
                <>
                  <FaSave /> Salvar Anotação
                </>
              )}
            </Button>
          </div>

          {/* Lista de Anotações */}
          <div className="client-profile__notes-list">
            {notes.length === 0 ? (
              <div className="client-profile__empty">
                <p>Nenhuma anotação ainda. Adicione a primeira!</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="client-profile__note">
                  <div className="client-profile__note-header">
                    <span className="client-profile__note-date">
                      {formatDate(note.createdAt)}
                    </span>
                    <div className="client-profile__note-actions">
                      {editingNoteId !== note.id && (
                        <>
                          <button
                            className="client-profile__note-btn client-profile__note-btn--edit"
                            onClick={() => handleStartEditNote(note)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="client-profile__note-btn client-profile__note-btn--delete"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingNoteId === note.id ? (
                    <div className="client-profile__note-edit">
                      <textarea
                        className="client-profile__textarea"
                        value={editingNoteContent}
                        onChange={(e) => setEditingNoteContent(e.target.value)}
                        rows={4}
                      />
                      <div className="client-profile__note-edit-actions">
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingNoteContent("");
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={handleSaveEditNote}
                        >
                          <FaSave /> Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="client-profile__note-content">
                      {note.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Seção de Documentos */}
        <div className="client-profile__section">
          <div className="client-profile__section-header">
            <h2 className="client-profile__section-title">
              <FaFileAlt style={{ marginRight: "0.5rem" }} />
              Documentos e Exames
            </h2>
            <Button
              variant="primary"
              size="small"
              onClick={() => setIsDocumentModalOpen(true)}
            >
              <FaPlus /> Adicionar Documento
            </Button>
          </div>

          <div className="client-profile__documents-list">
            {documents.length === 0 ? (
              <div className="client-profile__empty">
                <p>Nenhum documento anexado ainda.</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="client-profile__document">
                  <div className="client-profile__document-icon">
                    <FaFilePdf size={24} />
                  </div>
                  <div className="client-profile__document-info">
                    <h4 className="client-profile__document-name">
                      {doc.name}
                    </h4>
                    <span className="client-profile__document-date">
                      Enviado em {formatDate(doc.uploadedAt)}
                    </span>
                    <span className="client-profile__document-type">
                      Tipo: {doc.type}
                    </span>
                  </div>
                  <div className="client-profile__document-actions">
                    <button
                      className="client-profile__document-btn"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      <FaDownload /> Baixar
                    </button>
                    <button
                      className="client-profile__document-btn client-profile__document-btn--delete"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Seção de Retornos */}
      <div className="client-profile__section">
        <div className="client-profile__section-header">
          <h2 className="client-profile__section-title">
            <FaChartLine style={{ marginRight: "0.5rem" }} />
            Retornos
          </h2>
        </div>
        <div className="client-profile__returns-display">
          <div className="client-profile__returns-count">
            <span className="client-profile__returns-number">{returnCount}</span>
            <span className="client-profile__returns-label">
              {returnCount === 1 ? "consulta realizada" : "consultas realizadas"}
            </span>
          </div>
          {consultations.length > 0 && (
            <div className="client-profile__returns-info">
              <div className="client-profile__returns-stat">
                <span className="client-profile__returns-stat-label">Último retorno:</span>
                <span className="client-profile__returns-stat-value">
                  {formatDate(consultations[0].date)}
                </span>
              </div>
              {consultations.length > 1 && (
                <>
                  <div className="client-profile__returns-stat">
                    <span className="client-profile__returns-stat-label">Primeiro retorno:</span>
                    <span className="client-profile__returns-stat-value">
                      {formatDate(consultations[consultations.length - 1].date)}
                    </span>
                  </div>
                  {(() => {
                    const firstDate = consultations[consultations.length - 1].date;
                    const lastDate = consultations[0].date;
                    const daysDiff = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
                    const avgDays = Math.floor(daysDiff / (consultations.length - 1));
                    return (
                      <div className="client-profile__returns-stat">
                        <span className="client-profile__returns-stat-label">Média entre retornos:</span>
                        <span className="client-profile__returns-stat-value">
                          {avgDays} {avgDays === 1 ? "dia" : "dias"}
                        </span>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Seção de Histórico de Consultas */}
      <div className="client-profile__section client-profile__section--full">
        <div className="client-profile__section-header">
          <h2 className="client-profile__section-title">
            <FaCalendarCheck style={{ marginRight: "0.5rem" }} />
            Histórico de Consultas
          </h2>
          {user?.uid && (
            <Button
              variant="primary"
              size="small"
              onClick={() => setIsConsultationModalOpen(true)}
            >
              <FaPlus /> Nova Consulta
            </Button>
          )}
        </div>

        <div className="client-profile__consultations-list">
          {consultations.length === 0 ? (
            <div className="client-profile__empty">
              <p>Nenhuma consulta registrada ainda.</p>
              {user?.uid && (
                <Button
                  variant="primary"
                  onClick={() => setIsConsultationModalOpen(true)}
                  className="client-profile__create-btn"
                >
                  <FaPlus /> Registrar Primeira Consulta
                </Button>
              )}
            </div>
          ) : (
            consultations.map((consultation) => (
              <div key={consultation.id} className="client-profile__consultation-card">
                <div className="client-profile__consultation-header">
                  <div>
                    <h3 className="client-profile__consultation-date">
                      {formatDate(consultation.date)}
                    </h3>
                    {(consultation.weight || consultation.height || consultation.bodyFat || consultation.muscleMass) && (
                      <div className="client-profile__consultation-measurements">
                        {consultation.weight && (
                          <span className="client-profile__consultation-measurement">
                            Peso: {consultation.weight} kg
                          </span>
                        )}
                        {consultation.height && (
                          <span className="client-profile__consultation-measurement">
                            Altura: {consultation.height} cm
                          </span>
                        )}
                        {consultation.bodyFat && (
                          <span className="client-profile__consultation-measurement">
                            Gordura: {consultation.bodyFat}%
                          </span>
                        )}
                        {consultation.muscleMass && (
                          <span className="client-profile__consultation-measurement">
                            Massa Muscular: {consultation.muscleMass} kg
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {(consultation.complaints || consultation.observations || consultation.notes) && (
                  <div className="client-profile__consultation-content">
                    {consultation.complaints && (
                      <div className="client-profile__consultation-field">
                        <strong>Queixas:</strong>
                        <p>{consultation.complaints}</p>
                      </div>
                    )}
                    {consultation.observations && (
                      <div className="client-profile__consultation-field">
                        <strong>Observações:</strong>
                        <p>{consultation.observations}</p>
                      </div>
                    )}
                    {consultation.notes && (
                      <div className="client-profile__consultation-field">
                        <strong>Anotações:</strong>
                        <p>{consultation.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Seção de Objetivos */}
      <div className="client-profile__section client-profile__section--full">
        <div className="client-profile__section-header">
          <h2 className="client-profile__section-title">
            <FaBullseye style={{ marginRight: "0.5rem" }} />
            Objetivos
          </h2>
          {user?.uid && (
            <Button
              variant="primary"
              size="small"
              onClick={() => setIsGoalModalOpen(true)}
            >
              <FaPlus /> Novo Objetivo
            </Button>
          )}
        </div>

        <div className="client-profile__goals-list">
          {goals.length === 0 ? (
            <div className="client-profile__empty">
              <p>Nenhum objetivo definido ainda.</p>
              {user?.uid && (
                <Button
                  variant="primary"
                  onClick={() => setIsGoalModalOpen(true)}
                  className="client-profile__create-btn"
                >
                  <FaPlus /> Definir Primeiro Objetivo
                </Button>
              )}
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="client-profile__goal-card">
                <div className="client-profile__goal-header">
                  <div>
                    <h3 className="client-profile__goal-title">{goal.title}</h3>
                    {goal.description && (
                      <p className="client-profile__goal-description">{goal.description}</p>
                    )}
                    <div className="client-profile__goal-meta">
                      <span className="client-profile__goal-status client-profile__goal-status--active">
                        {goal.status === "active" && "Ativo"}
                        {goal.status === "completed" && "Concluído"}
                        {goal.status === "paused" && "Pausado"}
                        {goal.status === "cancelled" && "Cancelado"}
                      </span>
                      <span className="client-profile__goal-date">
                        Iniciado em {formatDate(goal.startDate)}
                      </span>
                      {goal.targetDate && (
                        <span className="client-profile__goal-date">
                          Meta: {formatDate(goal.targetDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {(goal.currentValue !== null || goal.targetValue !== null) && (
                  <div className="client-profile__goal-progress">
                    {goal.currentValue != null && goal.targetValue != null && goal.targetValue > 0 && (
                      <div className="client-profile__goal-progress-bar">
                        <div
                          className="client-profile__goal-progress-fill"
                          style={{
                            width: `${Math.min(((goal.currentValue ?? 0) / (goal.targetValue ?? 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    )}
                    <div className="client-profile__goal-values">
                      {goal.currentValue !== null && (
                        <span className="client-profile__goal-value">
                          Atual: {goal.currentValue} {goal.unit || ""}
                        </span>
                      )}
                      {goal.targetValue !== null && (
                        <span className="client-profile__goal-value">
                          Meta: {goal.targetValue} {goal.unit || ""}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modais */}
      {clientId && user?.uid && (
        <>
          <AddDocumentModal
            isOpen={isDocumentModalOpen}
            onClose={() => setIsDocumentModalOpen(false)}
            onSuccess={handleDocumentAdded}
            clientId={clientId}
          />
          <AddConsultationModal
            isOpen={isConsultationModalOpen}
            onClose={() => setIsConsultationModalOpen(false)}
            onSuccess={handleConsultationAdded}
            clientId={clientId}
            nutritionistId={user.uid}
          />
          <AddGoalModal
            isOpen={isGoalModalOpen}
            onClose={() => setIsGoalModalOpen(false)}
            onSuccess={handleGoalAdded}
            clientId={clientId}
            nutritionistId={user.uid}
          />
        </>
      )}
    </div>
  );
};
