import React, { useState } from "react";
import { OccupancyChart } from "./components/OccupancyChart";
import { ScheduleSummary } from "./components/ScheduleSummary";
import { FinancialChart } from "./components/FinancialChart";
import { ClientDemographics } from "./components/ClientDemographics";
import { BirthdayCard } from "./components/BirthdayCard";
import "./Dashboard.css";

export const Dashboard: React.FC = () => {
  const [occupancyPeriod, setOccupancyPeriod] = useState<
    "day" | "week" | "month"
  >("week");

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Visão geral do seu consultório</p>
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
        {/* Ocupação de Agenda */}
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

        {/* Agenda Resumida */}
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Agenda Resumida</h2>
          </div>
          <ScheduleSummary />
        </div>

        {/* Aniversariantes do Dia */}
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">🎉 Aniversariantes do Dia</h2>
          </div>
          <BirthdayCard />
        </div>

        {/* Gráfico Financeiro */}
        <div className="dashboard__card dashboard__card--large">
          <div className="dashboard__card-header">
            <h2 className="dashboard__card-title">Financeiro</h2>
          </div>
          <FinancialChart />
        </div>

        {/* Demografia de Clientes */}
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
