import React, { useState, useEffect } from "react";
import { FaTimes, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../../components/ui/Button/Button";
import {
  createExpense,
  updateTransaction,
} from "../../../services/financialService";
import type { FinancialTransaction } from "../../../types/financial";
import "./ExpenseModal.css";

interface ExpenseModalProps {
  transaction: FinancialTransaction | null;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  transaction,
  onClose,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date.toISOString().split("T")[0],
        category: transaction.category || "",
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setError(null);

    // Validações
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Valor deve ser maior que zero");
      return;
    }

    if (!formData.description.trim()) {
      setError("Descrição é obrigatória");
      return;
    }

    try {
      setLoading(true);

      if (transaction) {
        // Editar despesa existente
        await updateTransaction(transaction.id, {
          amount,
          description: formData.description.trim(),
          date: new Date(formData.date),
          category: formData.category.trim() || undefined,
        });
      } else {
        // Criar nova despesa
        await createExpense({
          nutritionistId: user.uid,
          amount,
          description: formData.description.trim(),
          date: new Date(formData.date),
          category: formData.category.trim() || undefined,
        });
      }

      onClose();
    } catch (err) {
      console.error("Erro ao salvar despesa:", err);
      setError("Erro ao salvar despesa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-modal__overlay" onClick={onClose}>
      <div
        className="expense-modal__content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="expense-modal__header">
          <h2 className="expense-modal__title">
            {transaction ? "Editar Despesa" : "Nova Despesa"}
          </h2>
          <button
            className="expense-modal__close"
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="expense-modal__error">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="expense-modal__form">
          <div className="expense-modal__field">
            <label className="expense-modal__label">
              Valor (R$) <span className="expense-modal__required">*</span>
            </label>
            <input
              type="number"
              className="expense-modal__input"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              disabled={loading}
            />
          </div>

          <div className="expense-modal__field">
            <label className="expense-modal__label">
              Descrição <span className="expense-modal__required">*</span>
            </label>
            <input
              type="text"
              className="expense-modal__input"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Ex: Aluguel do consultório"
              required
              disabled={loading}
            />
          </div>

          <div className="expense-modal__field">
            <label className="expense-modal__label">
              Data <span className="expense-modal__required">*</span>
            </label>
            <input
              type="date"
              className="expense-modal__input"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <div className="expense-modal__field">
            <label className="expense-modal__label">Categoria (opcional)</label>
            <input
              type="text"
              className="expense-modal__input"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Ex: Aluguel, Material, Marketing"
              disabled={loading}
            />
          </div>

          <div className="expense-modal__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="expense-modal__spinner" /> Salvando...
                </>
              ) : transaction ? (
                "Salvar Alterações"
              ) : (
                "Adicionar Despesa"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

