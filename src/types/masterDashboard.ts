/**
 * Tipos para o Dashboard Administrativo Master (PRD 005)
 * 
 * Nota: Estas métricas requerem um sistema de assinaturas/pagamentos.
 * Por enquanto, calculamos com base nos dados disponíveis (trial, role, etc.)
 */

export interface MasterDashboardMetrics {
  // Receita
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  revenueProjection: number; // Projeção futura de receita

  // Nutricionistas
  activePayingNutritionists: number; // Nutricionistas ativos pagantes
  trialNutritionists: number; // Nutricionistas em teste
  totalNutritionists: number; // Total de nutricionistas

  // Conversão e Churn
  trialToPaidConversionRate: number; // Taxa de conversão trial-to-paid (%)
  churnRate: number; // Taxa de cancelamento (%)
  ltv: number; // Lifetime Value (valor médio do cliente ao longo da vida)

  // Engajamento
  totalAppointments: number; // Total de agendamentos no sistema
  totalDiets: number; // Total de dietas salvas no sistema
  averageAppointmentsPerNutritionist: number; // Média de consultas por nutricionista
  averageDietsPerNutritionist: number; // Média de dietas por nutricionista
}

export interface EngagementData {
  month: string;
  monthIndex: number;
  year: number;
  appointments: number;
  diets: number;
}

export interface NutritionistStatus {
  uid: string;
  name: string;
  email: string;
  status: "trial" | "active" | "cancelled";
  trialEndDate?: Date;
  subscriptionPlan?: string;
  monthlyRevenue?: number;
  createdAt: Date;
}
