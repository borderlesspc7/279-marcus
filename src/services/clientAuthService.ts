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
      const userCredential = await signInWithEmailAndPassword(
        clientAuth,
        email,
        password
      );

      const firebaseUser = userCredential.user;
      const client = await getClientByAuthUid(firebaseUser.uid);

      if (!client) {
        throw new Error("Cliente não encontrado");
      }

      return client;
    } catch (error) {
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

