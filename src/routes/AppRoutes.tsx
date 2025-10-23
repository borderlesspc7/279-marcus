import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { paths } from "./paths";
import { RegisterPage } from "../pages/Register/Register";
import LoginPage from "../pages/Login/Login";
import ProtectedRoutes from "./ProtectedRoutes";
import { DashboardLayout } from "../components/layout/DashboardLayout/DashboardLayout";

export default function AppRoutes() {
  // Páginas temporárias - depois você pode substituir por componentes reais
  const DashboardHome = () => (
    <div>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: "1rem",
        }}
      >
        Dashboard
      </h1>
      <p style={{ color: "#6b7280" }}>
        Bem-vindo ao NutriManager! Selecione uma opção no menu lateral.
      </p>
    </div>
  );

  const Clientes = () => (
    <div>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: "1rem",
        }}
      >
        Clientes
      </h1>
      <p style={{ color: "#6b7280" }}>Gerencie seus clientes aqui.</p>
    </div>
  );

  const Agenda = () => (
    <div>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: "1rem",
        }}
      >
        Agenda
      </h1>
      <p style={{ color: "#6b7280" }}>Visualize e gerencie sua agenda.</p>
    </div>
  );

  const Calculadora = () => (
    <div>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: "1rem",
        }}
      >
        Calculadora de Dieta
      </h1>
      <p style={{ color: "#6b7280" }}>
        Monte dietas personalizadas para seus pacientes.
      </p>
    </div>
  );

  const Financeiro = () => (
    <div>
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: "1rem",
        }}
      >
        Financeiro
      </h1>
      <p style={{ color: "#6b7280" }}>Acompanhe suas finanças e relatórios.</p>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={paths.login} replace />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.register} element={<RegisterPage />} />

        {/* Rotas protegidas com DashboardLayout */}
        <Route
          path={paths.dashboard}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <DashboardHome />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.clientes}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <Clientes />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.agenda}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <Agenda />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.calculadora}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <Calculadora />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.financeiro}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <Financeiro />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
