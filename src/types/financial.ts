export type TransactionType = "income" | "expense";

export interface FinancialTransaction {
  id: string;
  nutritionistId: string;
  type: TransactionType;
  amount: number; // valor em reais
  description: string;
  date: Date;
  // Para receitas (income)
  appointmentId?: string; // ID da consulta que gerou a receita
  clientId?: string; // ID do cliente (se vinculado a consulta)
  clientName?: string; // Nome do cliente (para facilitar visualização)
  // Para despesas (expense)
  category?: string; // categoria da despesa (opcional)
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIncomeData {
  nutritionistId: string;
  amount: number;
  description: string;
  date: Date;
  appointmentId?: string;
  clientId?: string;
  clientName?: string;
}

export interface CreateExpenseData {
  nutritionistId: string;
  amount: number;
  description: string;
  date: Date;
  category?: string;
}

export interface UpdateTransactionData {
  amount?: number;
  description?: string;
  date?: Date;
  category?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeCount: number;
  expenseCount: number;
}

export interface MonthlyFinancialData {
  month: string; // "Jan", "Fev", etc.
  monthIndex: number; // 0-11
  year: number;
  income: number;
  expense: number;
  projection?: number; // projeção baseada em consultas futuras
}

