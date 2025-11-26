import { Navigate } from "react-router-dom";
import { paths } from "./paths";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

interface AdminRoutesProps {
  children: ReactNode;
}

export default function AdminRoutes({ children }: AdminRoutesProps) {
  const { user, loading } = useAuth();

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
        }}
      >
        <div>Carregando...</div>
      </div>
    );
  }

  // Verificar se o usuário está autenticado
  if (!user) {
    return <Navigate to={paths.login} replace />;
  }

  // Verificar se o usuário é admin
  if (user.role !== "admin") {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <>{children}</>;
}

