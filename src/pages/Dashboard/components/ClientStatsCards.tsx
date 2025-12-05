import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { getAppointmentsByClientAuthUid } from "../../../services/appointmentService";
import { getClientByAuthUid } from "../../../services/clientService";
import { getDietsByClient } from "../../../services/dietService";
import { FaCalendarCheck, FaUtensils, FaUser, FaChartLine } from "react-icons/fa";
import "./StatsCards.css";

interface ClientStats {
  totalAppointments: number;
  totalDiets: number;
  monthlyAppointments: number;
  upcomingAppointments: number;
}

export const ClientStatsCards: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ClientStats>({
    totalAppointments: 0,
    totalDiets: 0,
    monthlyAppointments: 0,
    upcomingAppointments: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);

        // Buscar cliente pelo authUid
        const client = await getClientByAuthUid(user.uid);
        if (!client) {
          setLoading(false);
          return;
        }

        // Carregar consultas do cliente
        const allAppointments = await getAppointmentsByClientAuthUid(user.uid);

        // Calcular consultas do mês atual
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const monthlyAppointments = allAppointments.filter(apt => {
          const aptDate = apt.date;
          return aptDate >= firstDayOfMonth && aptDate <= lastDayOfMonth;
        });

        // Consultas futuras
        const upcomingAppointments = allAppointments.filter(apt => {
          const aptDate = apt.date;
          return aptDate >= now && (apt.status === "scheduled" || apt.status === "pending");
        });

        // Carregar dietas do cliente
        const diets = await getDietsByClient(client.id);

        setStats({
          totalAppointments: allAppointments.length,
          totalDiets: diets.length,
          monthlyAppointments: monthlyAppointments.length,
          upcomingAppointments: upcomingAppointments.length,
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (loading) {
    return (
      <div className="stats-cards">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stats-card stats-card--loading">
            <div className="stats-card__skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-cards">
      <div className="stats-card stats-card--appointments">
        <div className="stats-card__icon">
          <FaCalendarCheck />
        </div>
        <div className="stats-card__content">
          <h3 className="stats-card__label">Consultas do Mês</h3>
          <p className="stats-card__value">{stats.monthlyAppointments}</p>
        </div>
      </div>

      <div className="stats-card stats-card--upcoming">
        <div className="stats-card__icon">
          <FaUser />
        </div>
        <div className="stats-card__content">
          <h3 className="stats-card__label">Próximas Consultas</h3>
          <p className="stats-card__value">{stats.upcomingAppointments}</p>
        </div>
      </div>

      <div className="stats-card stats-card--diets">
        <div className="stats-card__icon">
          <FaUtensils />
        </div>
        <div className="stats-card__content">
          <h3 className="stats-card__label">Minhas Dietas</h3>
          <p className="stats-card__value">{stats.totalDiets}</p>
        </div>
      </div>

      <div className="stats-card stats-card--total">
        <div className="stats-card__icon">
          <FaChartLine />
        </div>
        <div className="stats-card__content">
          <h3 className="stats-card__label">Total de Consultas</h3>
          <p className="stats-card__value">{stats.totalAppointments}</p>
        </div>
      </div>
    </div>
  );
};
