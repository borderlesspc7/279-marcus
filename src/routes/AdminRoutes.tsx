import React from "react";
import { Navigate } from "react-router-dom";
import { paths } from "./paths";
import { useAuth } from "../hooks/useAuth";
import { useTrial } from "../hooks/useTrial";
import { TrialBlockModal } from "../components/ui/TrialBlockModal/TrialBlockModal";
import type { ReactNode } from "react";

interface AdminRoutesProps {
  children: ReactNode;
}

export default function AdminRoutes({ children }: AdminRoutesProps) {
  const { user, loading } = useAuth();
  const { isExpired, shouldBlock } = useTrial();

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

  // Verificar se o trial expirou - redirecionar para página de trial expirado
  if (isExpired) {
    return <Navigate to={paths.trialExpired} replace />;
  }

  // Bloquear funcionalidades durante trial - mostrar modal de bloqueio
  // O modal pode ser fechado para permitir exploração, mas funcionalidades críticas devem ser bloqueadas
  // O modal sempre aparece ao fazer login/recarregar, exceto se o usuário optou por não mostrar mais
  if (shouldBlock) {
    const [isModalOpen, setIsModalOpen] = React.useState(() => {
      // Verificar se o usuário optou por não mostrar mais
      if (user?.uid) {
        const dontShowKey = `trial-block-dont-show-${user.uid}`;
        return localStorage.getItem(dontShowKey) !== "true";
      }
      return true;
    });
    
    return (
      <>
        {isModalOpen && (
          <TrialBlockModal onClose={() => setIsModalOpen(false)} />
        )}
        {children}
      </>
    );
  }

  return <>{children}</>;
}

