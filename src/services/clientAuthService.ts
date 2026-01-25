import { clientAuth } from "../lib/clientFirebaseConfig";
import {
  signInWithEmailAndPassword,
  signOut,
  type Unsubscribe,
  onAuthStateChanged,
} from "firebase/auth";
import { getClientByAuthUid } from "./clientService";
import type { Client } from "../types/client";
import getFirebaseErrorMessage from "../components/ui/ErrorMessage";

interface firebaseError {
  code?: string;
  message?: string;
}

export const clientAuthService = {
  async logOut(): Promise<void> {
    try {
      await signOut(clientAuth);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as firebaseError | string);
      throw new Error(message);
    }
  },

  async login(email: string, password: string): Promise<Client> {
    try {
      console.log("Tentando fazer login com email:", email);
      const userCredential = await signInWithEmailAndPassword(
        clientAuth,
        email,
        password
      );

      const firebaseUser = userCredential.user;
      console.log("Autenticação bem-sucedida. UID:", firebaseUser.uid, "Email:", email);
      
      let client = await getClientByAuthUid(firebaseUser.uid);
      console.log("Cliente encontrado no Firestore por authUid:", client ? "Sim" : "Não");

      // Se não encontrou por authUid, tentar buscar por email (fallback)
      if (!client) {
        console.warn("Tentando buscar cliente por email como fallback...");
        try {
          const { getClientByEmail, updateClient } = await import("./clientService");
          client = await getClientByEmail(email);
          console.log("Cliente encontrado por email:", client ? "Sim" : "Não");
          
          // Se encontrou por email mas não tem authUid ou está diferente, atualizar
          if (client) {
            if (!client.authUid || client.authUid !== firebaseUser.uid) {
              console.log("Atualizando authUid do cliente encontrado por email...");
              console.log("authUid atual:", client.authUid, "Novo authUid:", firebaseUser.uid);
              await updateClient(client.id, { authUid: firebaseUser.uid } as any);
              client.authUid = firebaseUser.uid;
              console.log("authUid atualizado com sucesso!");
            }
          }
        } catch (emailSearchError) {
          console.error("Erro ao buscar por email:", emailSearchError);
        }
      }

      if (!client) {
        // Se autenticou mas não encontrou o cliente no Firestore,
        // pode ser que o documento foi deletado mas a conta do Auth ainda existe
        console.error(
          `Cliente autenticado (UID: ${firebaseUser.uid}, Email: ${email}) ` +
          `mas não encontrado no Firestore. ` +
          `Isso pode indicar que o cliente foi deletado do Firestore mas a conta do Auth permanece.`
        );
        throw new Error(
          "Cliente não encontrado. Entre em contato com o suporte. " +
          "Pode ser que sua conta tenha sido removida do sistema."
        );
      }

      console.log("Login concluído com sucesso para:", client.fullName);
      return client;
    } catch (error) {
      // Se já é um erro nosso (cliente não encontrado), relançar
      if (error instanceof Error && error.message.includes("Cliente não encontrado")) {
        throw error;
      }

      // Preservar o código do erro original se for um erro do Firebase
      if (error && typeof error === "object" && "code" in error) {
        const firebaseErr = error as firebaseError;
        const message = getFirebaseErrorMessage(firebaseErr);
        const newError = new Error(message) as Error & { code?: string };
        newError.code = firebaseErr.code;
        throw newError;
      }

      const message = getFirebaseErrorMessage(error as firebaseError | string);
      throw new Error(message);
    }
  },

  observeAuthState(callback: (client: Client | null) => void): Unsubscribe {
    try {
      return onAuthStateChanged(clientAuth, async (firebaseUser) => {
        if (firebaseUser) {
          // Usuário está logado, busca dados completos no Firestore
          try {
            const client = await getClientByAuthUid(firebaseUser.uid);
            callback(client);
          } catch (error) {
            callback(null);
          }
        } else {
          // Usuário não está logado
          callback(null);
        }
      });
    } catch (error) {
      throw new Error("Erro ao observar estado de autenticação: " + error);
    }
  },
};

