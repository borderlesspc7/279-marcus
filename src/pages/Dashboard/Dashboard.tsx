import React, { useState, useEffect } from "react";
import { OccupancyChart } from "./components/OccupancyChart";
import { ScheduleSummary } from "./components/ScheduleSummary";
import { FinancialChart } from "./components/FinancialChart";
import { ClientDemographics } from "./components/ClientDemographics";
import { BirthdayCard } from "./components/BirthdayCard";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import "./Dashboard.css";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { info, success } = useNotifications();
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";
  const [occupancyPeriod, setOccupancyPeriod] = useState<
    "day" | "week" | "month"
  >("week");

  // Exemplo: Adicionar notificação de boas-vindas ao carregar o dashboard
  useEffect(() => {
    if (user) {
      // Adicionar notificação de boas-vindas após um pequeno delay
      const timer = setTimeout(() => {
        info(
          "Bem-vindo ao NutriManager!",
          "Sistema de notificações ativo. Use o ícone de sino no header para ver suas notificações."
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, info]);

  // Dashboard simplificado para clientes (role user)
  if (isUser) {
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__title">Dashboard</h1>
            <p className="dashboard__subtitle">Bem-vindo ao NutriManager</p>
          </div>
          <div className="dashboard__date">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="dashboard__grid">
          <div className="dashboard__card dashboard__card--large">
            <div className="dashboard__card-header">
              <h2 className="dashboard__card-title">Bem-vindo!</h2>
            </div>
            <div className="dashboard__welcome-content">
              <p>
                Use o menu lateral para solicitar uma consulta ou visualizar
                suas consultas agendadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">
            {isAdmin
              ? "Visão geral do sistema"
              : "Visão geral do seu consultório"}
          </p>
        </div>
        <div className="dashboard__date">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="dashboard__grid">
        {/* Ocupação de Agenda - Visível para todos */}
        <div className="dashboard__card dashboard__card--large">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Ocupação de Agenda</h2>
            <div className="dashboard__period-selector">
              <button
                className={`dashboard__period-btn ${
                  occupancyPeriod === "day" ? "active" : ""
                }`}
                onClick={() => setOccupancyPeriod("day")}
              >
                Dia
              </button>
              <button
                className={`dashboard__period-btn ${
                  occupancyPeriod === "week" ? "active" : ""
                }`}
                onClick={() => setOccupancyPeriod("week")}
              >
                Semana
              </button>
              <button
                className={`dashboard__period-btn ${
                  occupancyPeriod === "month" ? "active" : ""
                }`}
                onClick={() => setOccupancyPeriod("month")}
              >
                Mês
              </button>
            </div>
          </div>
          <OccupancyChart period={occupancyPeriod} />
        </div>

        {/* Agenda Resumida - Visível para todos */}
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Agenda Resumida</h2>
          </div>
          <ScheduleSummary />
        </div>

        {/* Aniversariantes do Dia - Visível para todos */}
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">🎉 Aniversariantes do Dia</h2>
          </div>
          <BirthdayCard />
        </div>

        {/* Gráfico Financeiro - Apenas para Admin */}
        {isAdmin && (
          <div className="dashboard__card dashboard__card--large">
            <div className="dashboard__card-header">
              <h2 className="dashboard__card-title">Financeiro</h2>
            </div>
            <FinancialChart />
          </div>
        )}

        {/* Demografia de Clientes - Visível para todos */}
        <div className="dashboard__card dashboard__card--large">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Perfil de Clientes</h2>
          </div>
          <ClientDemographics />
        </div>
      </div>
    </div>
  );
};
