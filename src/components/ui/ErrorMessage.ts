interface FirebaseError {
  code?: string;
  message?: string;
}

// Tipo para erros que podem ter código (Firebase ou Error customizado)
type ErrorWithCode = FirebaseError | (Error & { code?: string });

export default function getFirebaseErrorMessage(
  error: string | ErrorWithCode
): string {
  if (typeof error === "string") {
    return error;
  }

  // Extrair código do erro (pode estar em error.code ou (error as any).code)
  const errorCode = (error as any)?.code || error?.code || "";

  switch (errorCode) {
    // Erros de Autenticação - Credenciais incorretas
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/missing-password":
      return "Email ou senha incorreto. Verifique suas credenciais e tente novamente.";

    case "auth/invalid-email":
      return "Email inválido. Verifique o formato.";

    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente em alguns minutos.";

    case "auth/user-disabled":
      return "Conta desabilitada. Entre em contato com o suporte.";

    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet.";

    case "auth/invalid-api-key":
      return "Erro de configuração. Entre em contato com o suporte.";

    // Erros do Firestore
    case "permission-denied":
      return "Permissão negada. Verifique as regras de segurança do Firestore. O usuário autenticado não tem permissão para acessar este recurso.";

    case "unavailable":
      return "Serviço temporariamente indisponível. Tente novamente em alguns instantes.";

    case "failed-precondition":
      return "Operação falhou devido a uma condição prévia não atendida.";

    case "not-found":
      return "Recurso não encontrado.";

    default:
      // Se for um erro do Firebase mas não tiver código específico, mostrar a mensagem original
      if (error?.message && typeof error === "object") {
        return error.message;
      }
      return "Erro inesperado. Tente novamente.";
  }
}
