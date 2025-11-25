import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaDownload,
  FaCalendarAlt,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button/Button";
import {
  getTransactionsByNutritionist,
  deleteTransaction,
  getFinancialSummary,
} from "../../services/financialService";
import type { FinancialTransaction } from "../../types/financial";
import { ExpenseModal } from "./components/ExpenseModal";
import "./Financeiro.css";

export const Financeiro: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0,
  });
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<FinancialTransaction | null>(null);
  const [dateFilter, setDateFilter] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  useEffect(() => {
    loadData();
  }, [user, filter, dateFilter]);

  const loadData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Preparar filtros de data
      const startDate = dateFilter.startDate
        ? new Date(dateFilter.startDate)
        : undefined;
      const endDate = dateFilter.endDate
        ? new Date(dateFilter.endDate)
        : undefined;

      // Carregar transações
      const transactionsData = await getTransactionsByNutritionist(
        user.uid,
        startDate,
        endDate,
        filter === "all" ? undefined : filter
      );
      setTransactions(transactionsData);

      // Carregar resumo (com mesmo período)
      const summaryData = await getFinancialSummary(
        user.uid,
        startDate,
        endDate
      );
      setSummary(summaryData);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (
      !window.confirm("Tem certeza que deseja excluir esta transação?")
    ) {
      return;
    }

    try {
      await deleteTransaction(transactionId);
      loadData();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      alert("Erro ao excluir transação. Tente novamente.");
    }
  };

  const handleEdit = (transaction: FinancialTransaction) => {
    if (transaction.type === "expense") {
      setEditingTransaction(transaction);
      setShowExpenseModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowExpenseModal(false);
    setEditingTransaction(null);
    loadData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const handleExportCSV = () => {
    const headers = ["Tipo", "Data", "Descrição", "Valor", "Cliente", "Categoria"];
    const rows = transactions.map((t) => [
      t.type === "income" ? "Receita" : "Despesa",
      formatDate(t.date),
      t.description,
      t.amount.toFixed(2).replace(".", ","),
      t.clientName || "-",
      t.category || "-",
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transacoes_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearDateFilter = () => {
    setDateFilter({});
  };

  if (loading) {
    return (
      <div className="financeiro__loading">
        <FaSpinner className="financeiro__spinner" />
        <p>Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="financeiro">
      <div className="financeiro__header">
        <div>
          <h1 className="financeiro__title">Financeiro</h1>
          <p className="financeiro__subtitle">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowExpenseModal(true)}
          className="financeiro__add-button"
        >
          <FaPlus /> Adicionar Despesa
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="financeiro__summary">
        <div className="financeiro__summary-card financeiro__summary-card--income">
          <div className="financeiro__summary-header">
            <FaArrowUp />
            <span>Receitas</span>
          </div>
          <div className="financeiro__summary-value">
            {formatCurrency(summary.totalIncome)}
          </div>
          <div className="financeiro__summary-count">
            {summary.incomeCount} transação{summary.incomeCount !== 1 ? "ões" : ""}
          </div>
          {summary.incomeCount > 0 && (
            <div className="financeiro__summary-avg">
              Média: {formatCurrency(summary.totalIncome / summary.incomeCount)}
            </div>
          )}
        </div>

        <div className="financeiro__summary-card financeiro__summary-card--expense">
          <div className="financeiro__summary-header">
            <FaArrowDown />
            <span>Despesas</span>
          </div>
          <div className="financeiro__summary-value">
            {formatCurrency(summary.totalExpense)}
          </div>
          <div className="financeiro__summary-count">
            {summary.expenseCount} transação{summary.expenseCount !== 1 ? "ões" : ""}
          </div>
          {summary.expenseCount > 0 && (
            <div className="financeiro__summary-avg">
              Média: {formatCurrency(summary.totalExpense / summary.expenseCount)}
            </div>
          )}
        </div>

        <div className="financeiro__summary-card financeiro__summary-card--balance">
          <div className="financeiro__summary-header">
            <span>Saldo</span>
          </div>
          <div className="financeiro__summary-value">
            {formatCurrency(summary.balance)}
          </div>
          <div className="financeiro__summary-count">
            {summary.balance > 0 ? "Positivo" : summary.balance < 0 ? "Negativo" : "Neutro"}
          </div>
          {summary.totalIncome > 0 && (
            <div className="financeiro__summary-avg">
              Margem: {((summary.balance / summary.totalIncome) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="financeiro__filters">
        <div className="financeiro__filter-group">
          <FaFilter />
          <span>Filtrar:</span>
          <button
            className={`financeiro__filter-btn ${
              filter === "all" ? "financeiro__filter-btn--active" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            Todas
          </button>
          <button
            className={`financeiro__filter-btn ${
              filter === "income" ? "financeiro__filter-btn--active" : ""
            }`}
            onClick={() => setFilter("income")}
          >
            Receitas
          </button>
          <button
            className={`financeiro__filter-btn ${
              filter === "expense" ? "financeiro__filter-btn--active" : ""
            }`}
            onClick={() => setFilter("expense")}
          >
            Despesas
          </button>
        </div>

        <div className="financeiro__filter-group">
          <FaCalendarAlt />
          <span>Período:</span>
          <input
            type="date"
            className="financeiro__date-input"
            value={dateFilter.startDate || ""}
            onChange={(e) =>
              setDateFilter({ ...dateFilter, startDate: e.target.value })
            }
            placeholder="Data inicial"
          />
          <span>até</span>
          <input
            type="date"
            className="financeiro__date-input"
            value={dateFilter.endDate || ""}
            onChange={(e) =>
              setDateFilter({ ...dateFilter, endDate: e.target.value })
            }
            placeholder="Data final"
          />
          {(dateFilter.startDate || dateFilter.endDate) && (
            <button
              className="financeiro__filter-btn"
              onClick={handleClearDateFilter}
            >
              Limpar
            </button>
          )}
        </div>

        <div className="financeiro__filter-group">
          <Button
            variant="secondary"
            size="small"
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
          >
            <FaDownload /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="financeiro__transactions">
        {transactions.length === 0 ? (
          <div className="financeiro__empty">
            <p>Nenhuma transação encontrada</p>
            <p className="financeiro__empty-subtitle">
              {filter === "all"
                ? "Adicione uma despesa ou aguarde receitas de consultas realizadas"
                : filter === "income"
                ? "Receitas são criadas automaticamente quando você marca uma consulta como realizada"
                : "Adicione sua primeira despesa clicando no botão acima"}
            </p>
          </div>
        ) : (
          <div className="financeiro__transactions-list">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`financeiro__transaction financeiro__transaction--${transaction.type}`}
              >
                <div className="financeiro__transaction-info">
                  <div className="financeiro__transaction-header">
                    <span className="financeiro__transaction-type">
                      {transaction.type === "income" ? (
                        <FaArrowUp />
                      ) : (
                        <FaArrowDown />
                      )}
                      {transaction.type === "income" ? "Receita" : "Despesa"}
                    </span>
                    <span className="financeiro__transaction-date">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                  <div className="financeiro__transaction-description">
                    {transaction.description}
                  </div>
                  {transaction.clientName && (
                    <div className="financeiro__transaction-client">
                      Cliente: {transaction.clientName}
                    </div>
                  )}
                  {transaction.category && (
                    <div className="financeiro__transaction-category">
                      Categoria: {transaction.category}
                    </div>
                  )}
                </div>
                <div className="financeiro__transaction-actions">
                  <div className="financeiro__transaction-value">
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                  {transaction.type === "expense" && (
                    <div className="financeiro__transaction-buttons">
                      <button
                        className="financeiro__transaction-btn financeiro__transaction-btn--edit"
                        onClick={() => handleEdit(transaction)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="financeiro__transaction-btn financeiro__transaction-btn--delete"
                        onClick={() => handleDelete(transaction.id)}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Despesa */}
      {showExpenseModal && (
        <ExpenseModal
          transaction={editingTransaction}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

