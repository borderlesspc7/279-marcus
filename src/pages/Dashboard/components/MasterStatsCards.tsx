import React, { useState, useEffect } from "react";
import {
  FaDollarSign,
  FaUsers,
  FaChartLine,
  FaPercentage,
  FaArrowUp,
} from "react-icons/fa";
import { getMasterDashboardMetrics } from "../../../services/masterDashboardService";
import { FaSpinner } from "react-icons/fa";
import "./MasterStatsCards.css";

export const MasterStatsCards: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMasterDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Erro ao carregar métricas do dashboard master:", err);
        setError("Erro ao carregar métricas");
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="master-stats-cards__loading">
        <FaSpinner className="spinner" />
        <p>Carregando métricas...</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="master-stats-cards__error">
        <p>{error || "Não foi possível carregar as métricas"}</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="master-stats-cards">
      {/* MRR */}
      <div className="master-stats-card master-stats-card--revenue">
        <div className="master-stats-card__icon">
          <FaDollarSign />
        </div>
        <div className="master-stats-card__content">
          <h3 className="master-stats-card__label">MRR</h3>
          <p className="master-stats-card__value">{formatCurrency(metrics.mrr)}</p>
          <p className="master-stats-card__subtitle">Receita Recorrente Mensal</p>
        </div>
      </div>

      {/* ARR */}
      <div className="master-stats-card master-stats-card--revenue">
        <div className="master-stats-card__icon">
          <FaChartLine />
        </div>
        <div className="master-stats-card__content">
          <h3 className="master-stats-card__label">ARR</h3>
          <p className="master-stats-card__value">{formatCurrency(metrics.arr)}</p>
          <p className="master-stats-card__subtitle">Receita Recorrente Anual</p>
        </div>
      </div>

      {/* Nutricionistas Ativos */}
      <div className="master-stats-card master-stats-card--users">
        <div className="master-stats-card__icon">
          <FaUsers />
        </div>
        <div className="master-stats-card__content">
          <h3 className="master-stats-card__label">Nutricionistas Ativos</h3>
          <p className="master-stats-card__value">{metrics.activePayingNutritionists}</p>
          <p className="master-stats-card__subtitle">
            {metrics.totalNutritionists} total
          </p>
        </div>
      </div>

      {/* Nutricionistas em Trial */}
      <div className="master-stats-card master-stats-card--trial">
        <div className="master-stats-card__icon">
          <FaUsers />
        </div>
        <div className="master-stats-card__content">
          <h3 className="master-stats-card__label">Em Trial</h3>
          <p className="master-stats-card__value">{metrics.trialNutritionists}</p>
          <p className="master-stats-card__subtitle">Período de teste</p>
        </div>
      </div>

      {/* Taxa de Conversão */}
      <div className="master-stats-card master-stats-card--conversion">
        <div className="master-stats-card__icon">
          <FaPercentage />
        </div>
        <div className="master-stats-card__content">
          <h3 className="master-stats-card__label">Taxa de Conversão</h3>
          <p className="master-stats-card__value">
            {formatPercentage(metrics.trialToPaidConversionRate)}
          </p>
          <p className="master-stats-card__subtitle">Trial → Pago</p>
        </div>
      </div>

      {/* Churn Rate */}
      <div className="master-stats-card master-stats-card--churn">
        <div className="master-stats-card__icon">
          <FaPercentage />
        </div>
        <div className="master-stats-card__content">
          <h3 className="master-stats-card__label">Churn Rate</h3>
          <p className="master-stats-card__value">
            {formatPercentage(metrics.churnRate)}
          </p>
          <p className="master-stats-card__subtitle">Taxa de cancelamento</p>
        </div>
      </div>

      {/* LTV */}
      <div className="master-stats-card master-stats-card--ltv">
        <div className="master-stats-card__icon">
          <FaDollarSign />
        </div>
        <div className="master-stats-card__content">
          <h3 className="master-stats-card__label">LTV</h3>
          <p className="master-stats-card__value">{formatCurrency(metrics.ltv)}</p>
          <p className="master-stats-card__subtitle">Lifetime Value</p>
        </div>
      </div>

      {/* Projeção de Receita */}
      <div className="master-stats-card master-stats-card--projection">
        <div className="master-stats-card__icon">
          <FaArrowUp />
        </div>
        <div className="master-stats-card__content">
          <h3 className="master-stats-card__label">Projeção</h3>
          <p className="master-stats-card__value">
            {formatCurrency(metrics.revenueProjection)}
          </p>
          <p className="master-stats-card__subtitle">Próximos 12 meses</p>
        </div>
      </div>
    </div>
  );
};
