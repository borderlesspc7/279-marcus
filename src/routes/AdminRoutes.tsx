import React, { useState, useEffect } from "react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Atualizar estado do modal quando o usuário mudar
  // Verificar localStorage e sessionStorage para decidir se deve mostrar
  useEffect(() => {
    if (user?.uid) {
      const dontShowKey = `trial-block-dont-show-${user.uid}`;
      const sessionDismissedKey = `trial-block-dismissed-${user.uid}`;
      
      // Não mostrar se o usuário optou por não mostrar mais (localStorage)
      const dontShowPermanently = localStorage.getItem(dontShowKey) === "true";
      
      // Não mostrar se já foi fechado nesta sessão (sessionStorage)
      const dismissedThisSession = sessionStorage.getItem(sessionDismissedKey) === "true";
      
      // Mostrar apenas se não foi dispensado permanentemente E não foi dispensado nesta sessão
      setIsModalOpen(!dontShowPermanently && !dismissedThisSession);
    }
  }, [user?.uid]);

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

  // Verificar se o usuário é admin ou nutricionista
  // AdminRoutes é usado para rotas que requerem permissões de nutricionista
  if (user.role !== "admin" && user.role !== "nutritionist") {
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

