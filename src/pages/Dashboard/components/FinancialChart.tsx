import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaArrowUp, FaArrowDown, FaChartLine } from "react-icons/fa";
import "./FinancialChart.css";

export const FinancialChart: React.FC = () => {
  // Dados mock de finanças
  const data = [
    {
      mes: "Jan",
      receber: 8500,
      pagar: 3200,
      projecao: 9000,
    },
    {
      mes: "Fev",
      receber: 9200,
      pagar: 3500,
      projecao: 9500,
    },
    {
      mes: "Mar",
      receber: 8800,
      pagar: 3100,
      projecao: 10200,
    },
    {
      mes: "Abr",
      receber: 10500,
      pagar: 3800,
      projecao: 11000,
    },
    {
      mes: "Mai",
      receber: 11200,
      pagar: 4000,
      projecao: 11500,
    },
    {
      mes: "Jun",
      receber: 0,
      pagar: 0,
      projecao: 12000,
    },
  ];

  // Calcular totais
  const totalReceber = data
    .filter((d) => d.receber > 0)
    .reduce((acc, curr) => acc + curr.receber, 0);
  const totalPagar = data
    .filter((d) => d.pagar > 0)
    .reduce((acc, curr) => acc + curr.pagar, 0);
  const saldo = totalReceber - totalPagar;
  const projecaoProximos = data
    .filter((d) => d.receber === 0)
    .reduce((acc, curr) => acc + curr.projecao, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="financial-chart">
      <div className="financial-chart__cards">
        <div className="financial-chart__card financial-chart__card--income">
          <div className="financial-chart__card-header">
            <FaArrowUp size={16} />
            <p className="financial-chart__card-label">A Receber</p>
          </div>
          <p className="financial-chart__card-value">
            {formatCurrency(totalReceber)}
          </p>
          <p className="financial-chart__card-subtitle">Últimos 5 meses</p>
        </div>

        <div className="financial-chart__card financial-chart__card--expense">
          <div className="financial-chart__card-header">
            <FaArrowDown size={16} />
            <p className="financial-chart__card-label">A Pagar</p>
          </div>
          <p className="financial-chart__card-value">
            {formatCurrency(totalPagar)}
          </p>
          <p className="financial-chart__card-subtitle">Últimos 5 meses</p>
        </div>

        <div className="financial-chart__card financial-chart__card--balance">
          <div className="financial-chart__card-header">
            <FaChartLine size={16} />
            <p className="financial-chart__card-label">Saldo</p>
          </div>
          <p className="financial-chart__card-value">{formatCurrency(saldo)}</p>
          <p className="financial-chart__card-subtitle">
            {saldo > 0 ? "Positivo" : "Negativo"}
          </p>
        </div>

        <div className="financial-chart__card financial-chart__card--projection">
          <div className="financial-chart__card-header">
            <FaChartLine size={16} />
            <p className="financial-chart__card-label">Projeção</p>
          </div>
          <p className="financial-chart__card-value">
            {formatCurrency(projecaoProximos)}
          </p>
          <p className="financial-chart__card-subtitle">Consultas futuras</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tickFormatter={(value) => `R$ ${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend />
          <Bar
            dataKey="receber"
            fill="#10b981"
            name="A Receber"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="pagar"
            fill="#ef4444"
            name="A Pagar"
            radius={[8, 8, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="projecao"
            stroke="#f59e0b"
            strokeWidth={2}
            name="Projeção"
            strokeDasharray="5 5"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
