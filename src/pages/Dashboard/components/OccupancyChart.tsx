import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../../hooks/useAuth";
import { getAppointmentsByNutritionist } from "../../../services/appointmentService";
import "./OccupancyChart.css";

interface OccupancyChartProps {
  period: "day" | "week" | "month";
}

// Horários de trabalho padrão (8h às 18h)
const WORK_HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const SLOTS_PER_HOUR = 2; // 2 slots de 30min por hora

export const OccupancyChart: React.FC<OccupancyChartProps> = ({ period }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Array<{ time: string; ocupacao: number }>>(
    []
  );
  const [stats, setStats] = useState({
    avgOccupancy: 0,
    scheduledAppointments: 0,
    freeSlots: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let startDate: Date;
        let endDate: Date;

        if (period === "day") {
          startDate = new Date(today);
          endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999);
        } else if (period === "week") {
          startDate = new Date(today);
          // Primeiro dia da semana (domingo = 0)
          const dayOfWeek = today.getDay();
          startDate.setDate(today.getDate() - dayOfWeek);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
        } else {
          // Mês
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
        }

        const appointments = await getAppointmentsByNutritionist(
          user.uid,
          startDate,
          endDate
        );

        // Filtrar apenas agendamentos agendados (não cancelados)
        const scheduledAppointments = appointments.filter(
          (apt) => apt.status === "scheduled" || apt.status === "completed"
        );

        let chartData: Array<{ time: string; ocupacao: number }> = [];
        let totalScheduled = 0;
        let totalSlots = 0;

        if (period === "day") {
          // Calcular ocupação por hora do dia
          const hourOccupancy: Record<string, number> = {};
          WORK_HOURS.forEach((hour) => {
            hourOccupancy[hour] = 0;
          });

          scheduledAppointments.forEach((apt) => {
            const aptDate = new Date(apt.date);
            if (
              aptDate.toDateString() === today.toDateString() &&
              apt.status !== "cancelled"
            ) {
              const startHour = apt.startTime.substring(0, 5);
              const endHour = apt.endTime.substring(0, 5);

              WORK_HOURS.forEach((hour) => {
                if (startHour <= hour && hour < endHour) {
                  hourOccupancy[hour] = (hourOccupancy[hour] || 0) + 1;
                }
              });
            }
          });

          chartData = WORK_HOURS.map((hour) => {
            const occupied = hourOccupancy[hour] || 0;
            const maxSlots = SLOTS_PER_HOUR;
            const ocupacao = Math.min(100, Math.round((occupied / maxSlots) * 100));
            totalScheduled += occupied;
            totalSlots += maxSlots;
            return { time: hour, ocupacao };
          });
        } else if (period === "week") {
          // Calcular ocupação por dia da semana
          const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
          const dayOccupancy: Record<string, { occupied: number; total: number }> = {};

          dayNames.forEach((day) => {
            dayOccupancy[day] = { occupied: 0, total: 0 };
          });

          // Calcular para cada dia da semana
          for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            const dayName = dayNames[currentDay.getDay()];

            const dayAppointments = scheduledAppointments.filter((apt) => {
              const aptDate = new Date(apt.date);
              return aptDate.toDateString() === currentDay.toDateString();
            });

            const daySlots = WORK_HOURS.length * SLOTS_PER_HOUR;
            dayOccupancy[dayName].occupied = dayAppointments.length;
            dayOccupancy[dayName].total = daySlots;
            totalScheduled += dayAppointments.length;
            totalSlots += daySlots;
          }

          chartData = dayNames.map((day) => {
            const { occupied, total } = dayOccupancy[day];
            const ocupacao = total > 0 ? Math.round((occupied / total) * 100) : 0;
            return { time: day, ocupacao };
          });
        } else {
          // Mês - calcular por semana
          const weeks: Array<{ start: Date; end: Date }> = [];
          let currentWeekStart = new Date(startDate);

          while (currentWeekStart <= endDate) {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(currentWeekStart.getDate() + 6);
            if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());

            weeks.push({ start: new Date(currentWeekStart), end: weekEnd });
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
          }

          chartData = weeks.map((week, index) => {
            const weekAppointments = scheduledAppointments.filter((apt) => {
              const aptDate = new Date(apt.date);
              return aptDate >= week.start && aptDate <= week.end;
            });

            // Calcular total de slots da semana (7 dias * horas * slots)
            const weekSlots = 7 * WORK_HOURS.length * SLOTS_PER_HOUR;
            const ocupacao =
              weekSlots > 0
                ? Math.round((weekAppointments.length / weekSlots) * 100)
                : 0;
            totalScheduled += weekAppointments.length;
            totalSlots += weekSlots;

            return { time: `Sem ${index + 1}`, ocupacao };
          });
        }

        const avgOccupancy =
          chartData.length > 0
            ? Math.round(
                chartData.reduce((acc, curr) => acc + curr.ocupacao, 0) /
                  chartData.length
              )
            : 0;

        const freeSlots = Math.max(0, totalSlots - totalScheduled);

        setData(chartData);
        setStats({
          avgOccupancy,
          scheduledAppointments: totalScheduled,
          freeSlots,
        });
      } catch (error) {
        console.error("Erro ao carregar dados de ocupação:", error);
        setData([]);
        setStats({ avgOccupancy: 0, scheduledAppointments: 0, freeSlots: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.uid, period]);

  if (loading) {
    return (
      <div className="occupancy-chart">
        <div className="occupancy-chart__loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="occupancy-chart">
      <div className="occupancy-chart__stats">
        <div className="occupancy-chart__stat">
          <p className="occupancy-chart__stat-label">Ocupação Média</p>
          <p className="occupancy-chart__stat-value occupancy-chart__stat-value--primary">
            {stats.avgOccupancy}%
          </p>
        </div>
        <div className="occupancy-chart__stat">
          <p className="occupancy-chart__stat-label">Consultas Agendadas</p>
          <p className="occupancy-chart__stat-value occupancy-chart__stat-value--success">
            {stats.scheduledAppointments}
          </p>
        </div>
        <div className="occupancy-chart__stat">
          <p className="occupancy-chart__stat-label">Horários Livres</p>
          <p className="occupancy-chart__stat-value occupancy-chart__stat-value--warning">
            {stats.freeSlots}
          </p>
        </div>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorOcupacao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number) => [`${value}%`, "Ocupação"]}
            />
            <Area
              type="monotone"
              dataKey="ocupacao"
              stroke="#667eea"
              strokeWidth={2}
              fill="url(#colorOcupacao)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="occupancy-chart__empty">
          <p>Nenhum dado disponível para o período selecionado</p>
        </div>
      )}
    </div>
  );
};
