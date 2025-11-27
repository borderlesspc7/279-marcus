import React, { useState, useRef } from "react";
import { FaTimes, FaSave, FaSpinner, FaFileUpload } from "react-icons/fa";
import { Button } from "../../../components/ui/Button/Button";
import { uploadFile } from "../../../services/storageService";
import { addClientDocument } from "../../../services/clientService";
import "./AddDocumentModal.css";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"exame-sangue" | "bioimpedancia" | "outro">("exame-sangue");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Se o nome não foi preenchido, usar o nome do arquivo
      if (!name.trim()) {
        setName(e.target.files[0].name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nome do documento é obrigatório");
      return;
    }

    if (!file) {
      setError("Selecione um arquivo");
      return;
    }

    try {
      setLoading(true);

      // Fazer upload do arquivo
      const filePath = `documents/${clientId}/${Date.now()}_${file.name}`;
      const fileUrl = await uploadFile(file, filePath);

      // Adicionar documento ao Firestore
      await addClientDocument(clientId, name.trim(), type, fileUrl);

      // Limpar formulário
      setName("");
      setType("exame-sangue");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao adicionar documento:", err);
      setError("Erro ao adicionar documento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setName("");
    setType("exame-sangue");
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="document-modal-overlay" onClick={handleClose}>
      <div className="document-modal" onClick={(e) => e.stopPropagation()}>
        <div className="document-modal__header">
          <h2 className="document-modal__title">Adicionar Documento</h2>
          <button
            className="document-modal__close"
            onClick={handleClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="document-modal__form">
          {error && (
            <div className="document-modal__error">
              <p>{error}</p>
            </div>
          )}

          <div className="document-modal__field">
            <label className="document-modal__label">
              Nome do Documento <span className="document-modal__required">*</span>
            </label>
            <input
              type="text"
              className="document-modal__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Exame de sangue - 2025"
              disabled={loading}
            />
          </div>

          <div className="document-modal__field">
            <label className="document-modal__label">
              Tipo de Documento <span className="document-modal__required">*</span>
            </label>
            <select
              className="document-modal__select"
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              disabled={loading}
            >
              <option value="exame-sangue">Exame de Sangue</option>
              <option value="bioimpedancia">Bioimpedância</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div className="document-modal__field">
            <label className="document-modal__label">
              Arquivo <span className="document-modal__required">*</span>
            </label>
            <div className="document-modal__file-upload">
              <input
                ref={fileInputRef}
                type="file"
                className="document-modal__file-input"
                onChange={handleFileChange}
                disabled={loading}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {file && (
                <div className="document-modal__file-info">
                  <FaFileUpload />
                  <span>{file.name}</span>
                  <span className="document-modal__file-size">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="document-modal__actions">
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
                  <FaSpinner className="document-modal__spinner" /> Salvando...
                </>
              ) : (
                <>
                  <FaSave /> Salvar Documento
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

