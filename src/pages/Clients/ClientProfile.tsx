import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
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
} from "react-icons/fa";
import { Button } from "../../components/ui/Button/Button";
import {
  getClientById,
  getClientNotes,
  addClientNote,
  updateClientNote,
  deleteClientNote,
  getClientDocuments,
  deleteClientDocument,
  updateClient,
} from "../../services/clientService";
import type { Client, ClientNote, ClientDocument } from "../../types/client";
import { AddDocumentModal } from "./components/AddDocumentModal";
import "./ClientProfile.css";

export const ClientProfile: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para nova nota
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Estados para edição de nota
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  // Estado para modal de documento
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

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

      const [clientData, notesData, documentsData] = await Promise.all([
        getClientById(clientId),
        getClientNotes(clientId),
        getClientDocuments(clientId),
      ]);

      if (!clientData) {
        setError("Cliente não encontrado");
        return;
      }

      setClient(clientData);
      setNotes(notesData);
      setDocuments(documentsData);
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
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/clientes")}
          className="client-profile__back-button"
        >
          <FaArrowLeft /> Voltar
        </Button>
      </div>

      {/* Card de Informações do Cliente */}
      <div className="client-profile__info-card">
        <div className="client-profile__avatar">
          <FaUser size={40} />
        </div>
        <div className="client-profile__info">
          <h1 className="client-profile__name">{client.fullName}</h1>

          <div className="client-profile__details">
            <div className="client-profile__detail-item">
              <FaEnvelope className="client-profile__icon" />
              <span>{client.email}</span>
            </div>

            <div className="client-profile__detail-item">
              <FaPhone className="client-profile__icon" />
              <span>{client.phone}</span>
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

          {/* Edição de Altura e Peso */}
          <div className="client-profile__measurements">
            <div className="client-profile__measurements-header">
              <h3 className="client-profile__measurements-title">
                Medidas Corporais
              </h3>
              {!isEditingMeasurements && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleStartEditMeasurements}
                >
                  <FaEdit /> Editar
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

      {/* Modal de Adicionar Documento */}
      {clientId && (
        <AddDocumentModal
          isOpen={isDocumentModalOpen}
          onClose={() => setIsDocumentModalOpen(false)}
          onSuccess={handleDocumentAdded}
          clientId={clientId}
        />
      )}
    </div>
  );
};
