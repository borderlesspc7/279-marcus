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
    // Verificar se a rota atual é uma rota de cliente
    const currentPath = window.location.pathname;
    const clientRoutes = [
      paths.solicitarConsulta,
      paths.minhasConsultas,
      paths.minhasDietas,
      paths.minhaDietaDetail,
      paths.solicitarSubstituicao,
      paths.minhasSubstituicoes,
      paths.clientePerfil,
    ];
    
    // Se for uma rota de cliente, redirecionar para login de clientes
    const isClientRoute = clientRoutes.some(route => {
      // Para rotas com parâmetros, verificar se o path começa com o padrão
      if (route.includes(':')) {
        const routePattern = route.split(':')[0];
        return currentPath.startsWith(routePattern);
      }
      return currentPath === route;
    });
    
    if (isClientRoute) {
      return <Navigate to={paths.clientLogin} replace />;
    }
    
    // Caso contrário, redirecionar para login de nutricionistas
    return <Navigate to={paths.login} replace />;
  }

  return <>{children}</>;
}
