/**
 * Serviço para calcular métricas do Dashboard Administrativo Master (PRD 005)
 * 
 * Nota: Como não há sistema de assinaturas/pagamentos implementado ainda,
 * algumas métricas são calculadas com base em dados disponíveis ou retornam valores simulados.
 */

import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { MasterDashboardMetrics, EngagementData, NutritionistStatus } from "../types/masterDashboard";
import { getAppointmentsByNutritionist } from "./appointmentService";
import { getDietsByNutritionist } from "./dietService";

const USERS_COLLECTION = "users";

/**
 * Preços dos planos (mesmos valores da página de Subscription)
 * TODO: Quando o sistema de pagamento for implementado, buscar valores reais das assinaturas
 */
const PLAN_PRICES = {
  basic: 49.9,
  professional: 99.9,
  enterprise: 199.9,
};

/**
 * Busca todos os nutricionistas (usuários com role "admin")
 */
export const getAllNutritionists = async (): Promise<NutritionistStatus[]> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where("role", "==", "admin")
    );

    const querySnapshot = await getDocs(q);
    const now = new Date();

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const trialEndDate = data.trialEndDate
        ? (data.trialEndDate instanceof Timestamp
          ? data.trialEndDate.toDate()
          : new Date(data.trialEndDate))
        : undefined;

      // Determinar status baseado em trialEndDate
      let status: "trial" | "active" | "cancelled" = "active";
      if (trialEndDate) {
        if (now < trialEndDate) {
          status = "trial";
        } else {
          // Trial expirado - considerar como "active" se não houver sistema de pagamento
          // TODO: Quando houver sistema de pagamento, verificar se está pagando
          status = "active";
        }
      }

      return {
        uid: doc.id,
        name: data.name || "",
        email: data.email || "",
        status,
        trialEndDate,
        subscriptionPlan: data.subscriptionPlan || undefined,
        monthlyRevenue: data.subscriptionPlan
          ? PLAN_PRICES[data.subscriptionPlan as keyof typeof PLAN_PRICES] || 0
          : 0,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt),
      };
    });
  } catch (error) {
    console.error("Erro ao buscar nutricionistas:", error);
    throw error;
  }
};

/**
 * Calcula todas as métricas do Dashboard Master
 */
export const getMasterDashboardMetrics = async (): Promise<MasterDashboardMetrics> => {
  try {
    const nutritionists = await getAllNutritionists();
    const now = new Date();

    // Separar nutricionistas por status
    const trialNutritionists = nutritionists.filter((n) => n.status === "trial");
    const activePayingNutritionists = nutritionists.filter((n) => n.status === "active");
    const totalNutritionists = nutritionists.length;

    // Calcular MRR (Monthly Recurring Revenue)
    // Soma da receita mensal de todos os nutricionistas pagantes
    const mrr = activePayingNutritionists.reduce((sum, n) => {
      return sum + (n.monthlyRevenue || 0);
    }, 0);

    // Calcular ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Calcular projeção futura de receita (próximos 12 meses)
    // Por enquanto, usa o MRR atual como base
    const revenueProjection = arr;

    // Calcular taxa de conversão trial-to-paid
    // Por enquanto, simula: se trial expirou e não cancelou, considera convertido
    const expiredTrials = nutritionists.filter(
      (n) => n.trialEndDate && new Date(n.trialEndDate) < now
    );
    const converted = expiredTrials.filter((n) => n.status === "active").length;
    const trialToPaidConversionRate =
      expiredTrials.length > 0 ? (converted / expiredTrials.length) * 100 : 0;

    // Calcular Churn Rate
    // Por enquanto, retorna 0 pois não há sistema de cancelamento
    // TODO: Quando houver sistema de pagamento, calcular baseado em cancelamentos
    const churnRate = 0;

    // Calcular LTV (Lifetime Value)
    // LTV = ARPU (Average Revenue Per User) / Churn Rate
    // Por enquanto, usa uma estimativa baseada no MRR médio
    const averageMRR = activePayingNutritionists.length > 0
      ? mrr / activePayingNutritionists.length
      : 0;
    const ltv = churnRate > 0 ? averageMRR / (churnRate / 100) : averageMRR * 12; // Se churn = 0, assume 1 ano mínimo

    // Calcular métricas de engajamento
    let totalAppointments = 0;
    let totalDiets = 0;

    // Buscar agendamentos e dietas de todos os nutricionistas
    for (const nutritionist of nutritionists) {
      try {
        const appointments = await getAppointmentsByNutritionist(nutritionist.uid);
        totalAppointments += appointments.length;

        const diets = await getDietsByNutritionist(nutritionist.uid);
        totalDiets += diets.length;
      } catch (error) {
        console.warn(`Erro ao buscar dados de ${nutritionist.uid}:`, error);
      }
    }

    const averageAppointmentsPerNutritionist =
      totalNutritionists > 0 ? totalAppointments / totalNutritionists : 0;
    const averageDietsPerNutritionist =
      totalNutritionists > 0 ? totalDiets / totalNutritionists : 0;

    return {
      mrr,
      arr,
      revenueProjection,
      activePayingNutritionists: activePayingNutritionists.length,
      trialNutritionists: trialNutritionists.length,
      totalNutritionists,
      trialToPaidConversionRate,
      churnRate,
      ltv,
      totalAppointments,
      totalDiets,
      averageAppointmentsPerNutritionist,
      averageDietsPerNutritionist,
    };
  } catch (error) {
    console.error("Erro ao calcular métricas do dashboard master:", error);
    throw error;
  }
};

/**
 * Busca dados de engajamento por mês (últimos 12 meses)
 */
export const getEngagementData = async (months: number = 12): Promise<EngagementData[]> => {
  try {
    const nutritionists = await getAllNutritionists();
    const now = new Date();
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    // Inicializar dados mensais
    const monthlyData: Record<string, EngagementData> = {};

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyData[monthKey] = {
        month: monthNames[date.getMonth()],
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
        appointments: 0,
        diets: 0,
      };
    }

    // Buscar agendamentos e dietas
    for (const nutritionist of nutritionists) {
      try {
        const appointments = await getAppointmentsByNutritionist(nutritionist.uid);
        appointments.forEach((apt) => {
          const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date);
          const monthKey = `${aptDate.getFullYear()}-${aptDate.getMonth()}`;
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].appointments++;
          }
        });

        const diets = await getDietsByNutritionist(nutritionist.uid);
        diets.forEach((diet) => {
          const dietDate = diet.createdAt instanceof Date ? diet.createdAt : new Date(diet.createdAt);
          const monthKey = `${dietDate.getFullYear()}-${dietDate.getMonth()}`;
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].diets++;
          }
        });
      } catch (error) {
        console.warn(`Erro ao buscar dados de engajamento de ${nutritionist.uid}:`, error);
      }
    }

    return Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthIndex - b.monthIndex;
    });
  } catch (error) {
    console.error("Erro ao buscar dados de engajamento:", error);
    throw error;
  }
};
