import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./OccupancyChart.css";

interface OccupancyChartProps {
  period: "day" | "week" | "month";
}

export const OccupancyChart: React.FC<OccupancyChartProps> = ({ period }) => {
  // Dados mock baseados no período selecionado
  const getData = () => {
    if (period === "day") {
      return [
        { time: "08:00", ocupacao: 75 },
        { time: "09:00", ocupacao: 100 },
        { time: "10:00", ocupacao: 100 },
        { time: "11:00", ocupacao: 75 },
        { time: "12:00", ocupacao: 0 },
        { time: "13:00", ocupacao: 0 },
        { time: "14:00", ocupacao: 100 },
        { time: "15:00", ocupacao: 100 },
        { time: "16:00", ocupacao: 50 },
        { time: "17:00", ocupacao: 75 },
        { time: "18:00", ocupacao: 25 },
      ];
    } else if (period === "week") {
      return [
        { time: "Seg", ocupacao: 85 },
        { time: "Ter", ocupacao: 92 },
        { time: "Qua", ocupacao: 78 },
        { time: "Qui", ocupacao: 88 },
        { time: "Sex", ocupacao: 95 },
        { time: "Sáb", ocupacao: 60 },
        { time: "Dom", ocupacao: 0 },
      ];
    } else {
      return [
        { time: "Sem 1", ocupacao: 75 },
        { time: "Sem 2", ocupacao: 82 },
        { time: "Sem 3", ocupacao: 88 },
        { time: "Sem 4", ocupacao: 92 },
      ];
    }
  };

  const data = getData();
  const avgOccupancy = Math.round(
    data.reduce((acc, curr) => acc + curr.ocupacao, 0) / data.length
  );

  return (
    <div className="occupancy-chart">
      <div className="occupancy-chart__stats">
        <div className="occupancy-chart__stat">
          <p className="occupancy-chart__stat-label">Ocupação Média</p>
          <p className="occupancy-chart__stat-value occupancy-chart__stat-value--primary">
            {avgOccupancy}%
          </p>
        </div>
        <div className="occupancy-chart__stat">
          <p className="occupancy-chart__stat-label">Consultas Agendadas</p>
          <p className="occupancy-chart__stat-value occupancy-chart__stat-value--success">
            {period === "day" ? "8" : period === "week" ? "42" : "165"}
          </p>
        </div>
        <div className="occupancy-chart__stat">
          <p className="occupancy-chart__stat-label">Horários Livres</p>
          <p className="occupancy-chart__stat-value occupancy-chart__stat-value--warning">
            {period === "day" ? "3" : period === "week" ? "8" : "35"}
          </p>
        </div>
      </div>

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
    </div>
  );
};
