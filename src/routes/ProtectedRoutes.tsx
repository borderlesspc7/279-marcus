import { Navigate } from "react-router-dom";
import { paths } from "./paths";
import { useAuth } from "../hooks/useAuth";
import { clientAuth } from "../lib/clientFirebaseConfig";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export default function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  const { user, loading } = useAuth();
  const [clientAuthUser, setClientAuthUser] = useState<any>(null);
  const [checkingClient, setCheckingClient] = useState(true);

  useEffect(() => {
    // Verificar se há um cliente autenticado via clientAuth
    const unsubscribe = clientAuth.onAuthStateChanged((firebaseUser) => {
      setClientAuthUser(firebaseUser);
      setCheckingClient(false);
    });

    return () => unsubscribe();
  }, []);

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (loading || checkingClient) {
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

  // Redirecionar para login se não estiver autenticado (nem como nutricionista nem como cliente)
  if (!user && !clientAuthUser) {
    return <Navigate to={paths.login} replace />;
  }

  return <>{children}</>;
}
