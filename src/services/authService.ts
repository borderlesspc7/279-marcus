import { auth, db } from "../lib/firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type Unsubscribe,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc, Timestamp, query, getDocs, where } from "firebase/firestore";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/user";
import getFirebaseErrorMessage from "../components/ui/ErrorMessage";

interface firebaseError {
  code?: string;
  message?: string;
}

export const authService = {
  async logOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as firebaseError | string);
      throw new Error(message);
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado");
      }

      const userData = userDoc.data();
      // Converter Timestamps para Date se necessário
      const convertedUser: User = {
        ...userData,
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
        updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : userData.updatedAt,
        trialEndDate: userData.trialEndDate?.toDate ? userData.trialEndDate.toDate() : userData.trialEndDate,
      } as User;

      // Criar objeto de atualização removendo campos undefined
      const updateUserData: Record<string, unknown> = {
        ...convertedUser,
        lastLogin: new Date(),
      };

      // Remover campos undefined antes de salvar no Firestore
      Object.keys(updateUserData).forEach(key => {
        if (updateUserData[key] === undefined) {
          delete updateUserData[key];
        }
      });

      await setDoc(doc(db, "users", firebaseUser.uid), updateUserData);
      return updateUserData as unknown as User;
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

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      if (!credentials.email || !credentials.password || !credentials.name) {
        throw new Error("Todos os campos são obrigatórios");
      }

      if (credentials.password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const firebaseUser = userCredential.user;

      const role = credentials.role || "user";

      // Calcular data de término do trial (10 dias a partir de hoje) - apenas para admins
      const trialEndDate = role === "admin" ? (() => {
        const date = new Date();
        date.setDate(date.getDate() + 10);
        return date;
      })() : undefined;

      const newUserData: Record<string, unknown> = {
        uid: firebaseUser.uid,
        name: credentials.name,
        email: credentials.email,
        phone: credentials.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
        role,
      };

      // Adicionar trialEndDate apenas se for admin (não incluir undefined)
      if (trialEndDate) {
        newUserData.trialEndDate = trialEndDate;
      }

      await setDoc(doc(db, "users", firebaseUser.uid), newUserData);

      // Criar objeto User para retorno
      const newUser: User = {
        uid: firebaseUser.uid,
        name: credentials.name,
        email: credentials.email,
        phone: credentials.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
        role,
        ...(trialEndDate && { trialEndDate }),
      };

      // Se o usuário tem role "user", criar automaticamente como cliente
      if (role === "user") {
        try {
          // Buscar um admin/nutricionista padrão para associar o cliente
          // Busca o primeiro admin disponível
          let nutritionistId = "";
          try {
            const usersQuery = query(
              collection(db, "users"),
              where("role", "==", "admin")
            );
            const usersSnapshot = await getDocs(usersQuery);
            if (!usersSnapshot.empty) {
              nutritionistId = usersSnapshot.docs[0].id;
            }
          } catch (error) {
            console.warn("Erro ao buscar admin padrão:", error);
            // Se não encontrar admin, deixa vazio e será associado depois
          }

          const clientDoc = {
            fullName: credentials.name,
            email: credentials.email,
            phone: credentials.phone || "",
            birthDate: "", // Será preenchido depois pelo cliente ou admin
            gender: "outro" as const,
            height: null,
            weight: null,
            nutritionistId: nutritionistId, // Admin padrão ou vazio
            authUid: firebaseUser.uid, // Mesmo UID do usuário
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          await addDoc(collection(db, "clients"), clientDoc);
          console.log("Cliente criado automaticamente para usuário:", firebaseUser.uid);
        } catch (clientError) {
          // Não falhar o registro se houver erro ao criar cliente
          // O cliente pode ser criado manualmente depois
          console.warn("Erro ao criar cliente automaticamente:", clientError);
        }
      }

      return newUser as unknown as User;
    } catch (error) {
      const message = getFirebaseErrorMessage(error as firebaseError | string);
      throw new Error(message);
    }
  },

  observeAuthState(callback: (user: User | null) => void): Unsubscribe {
    try {
      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Usuário está logado, busca dados completos no Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              // Converter Timestamps para Date se necessário
              const convertedUser: User = {
                ...userData,
                createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
                updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : userData.updatedAt,
                trialEndDate: userData.trialEndDate?.toDate ? userData.trialEndDate.toDate() : userData.trialEndDate,
              } as User;
              callback(convertedUser);
            } else {
              callback(null); // Usuário não encontrado no Firestore
            }
          } catch {
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
