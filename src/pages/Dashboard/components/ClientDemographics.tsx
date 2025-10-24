import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaMale, FaFemale, FaUsers } from "react-icons/fa";
import "./ClientDemographics.css";

export const ClientDemographics: React.FC = () => {
  // Dados mock de gênero
  const genderData = [
    { name: "Mulheres", value: 68, color: "#ec4899" },
    { name: "Homens", value: 32, color: "#3b82f6" },
  ];

  // Dados mock de faixa etária
  const ageData = [
    { faixa: "18-25", quantidade: 15 },
    { faixa: "26-35", quantidade: 42 },
    { faixa: "36-45", quantidade: 38 },
    { faixa: "46-55", quantidade: 25 },
    { faixa: "56+", quantidade: 12 },
  ];

  const totalClients = genderData.reduce((acc, curr) => acc + curr.value, 0);
  const womenCount = genderData.find((d) => d.name === "Mulheres")?.value || 0;
  const menCount = genderData.find((d) => d.name === "Homens")?.value || 0;

  return (
    <div className="client-demographics">
      {/* Cards de resumo */}
      <div className="client-demographics__cards">
        <div className="client-demographics__card client-demographics__card--total">
          <FaUsers size={24} className="client-demographics__card-icon" />
          <p className="client-demographics__card-label">Total de Clientes</p>
          <p className="client-demographics__card-value">{totalClients}</p>
        </div>

        <div className="client-demographics__card client-demographics__card--female">
          <FaFemale size={24} className="client-demographics__card-icon" />
          <p className="client-demographics__card-label">Mulheres</p>
          <p className="client-demographics__card-value">{womenCount}%</p>
        </div>

        <div className="client-demographics__card client-demographics__card--male">
          <FaMale size={24} className="client-demographics__card-icon" />
          <p className="client-demographics__card-label">Homens</p>
          <p className="client-demographics__card-value">{menCount}%</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="client-demographics__charts">
        {/* Gráfico de pizza - Gênero */}
        <div>
          <h3 className="client-demographics__chart-title">
            Distribuição por Gênero
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras - Faixa Etária */}
        <div>
          <h3 className="client-demographics__chart-title">
            Distribuição por Faixa Etária
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="faixa"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number) => [
                  `${value} clientes`,
                  "Quantidade",
                ]}
              />
              <Bar
                dataKey="quantidade"
                fill="#667eea"
                radius={[8, 8, 0, 0]}
                name="Clientes"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
