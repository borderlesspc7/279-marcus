import { auth, db } from "../lib/firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  type Unsubscribe,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, collection, addDoc, Timestamp, query, getDocs, where } from "firebase/firestore";
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
      console.log("🟡 authService.login chamado com email:", credentials.email);
      console.log("🟡 Tentando autenticar no Firebase Auth...");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;
      console.log("🟡 Autenticação Firebase bem-sucedida. UID:", firebaseUser.uid);
      console.log("🟡 Buscando documento do usuário no Firestore...");
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        console.error("🔴 Documento do usuário não encontrado na coleção 'users'! UID:", firebaseUser.uid);
        
        // Verificar se é um cliente tentando fazer login como nutricionista
        console.log("🟡 Verificando se é um cliente...");
        try {
          const clientsQuery = query(
            collection(db, "clients"),
            where("authUid", "==", firebaseUser.uid)
          );
          const clientsSnapshot = await getDocs(clientsQuery);
          
          if (!clientsSnapshot.empty) {
            console.error("🔴 Este é um cliente! Use a página de login de clientes.");
            throw new Error(
              "Esta conta é de um cliente/paciente. " +
              "Por favor, use a página de login de clientes para fazer login."
            );
          }
        } catch (clientCheckError) {
          // Se der erro na query (falta de índice), continuar com o erro original
          console.warn("⚠️ Erro ao verificar se é cliente:", clientCheckError);
        }
        
        throw new Error("Usuário não encontrado");
      }
      
      console.log("🟡 Documento do usuário encontrado no Firestore!");

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

      // Verificar se já existe um admin antes de criar novo
      // Apenas um admin pode existir no sistema
      if (credentials.role === "admin") {
        const adminQuery = query(
          collection(db, "users"),
          where("role", "==", "admin")
        );
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          throw new Error("Já existe um administrador no sistema. Apenas um admin pode existir. Novos cadastros devem ser de nutricionista.");
        }
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const firebaseUser = userCredential.user;

      // Determinar role: se não especificado, criar como nutricionista
      // Novos cadastros via formulário são sempre nutricionistas
      const role = credentials.role || "nutritionist";

      // Calcular data de término do trial (10 dias a partir de hoje) - apenas para admin e nutricionistas
      const trialEndDate = (role === "admin" || role === "nutritionist") ? (() => {
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
          // Buscar um nutricionista padrão para associar o cliente
          // Busca o primeiro nutricionista disponível
          let nutritionistId = "";
          try {
            const usersQuery = query(
              collection(db, "users"),
              where("role", "==", "nutritionist")
            );
            const usersSnapshot = await getDocs(usersQuery);
            if (!usersSnapshot.empty) {
              nutritionistId = usersSnapshot.docs[0].id;
            }
          } catch (error) {
            console.warn("Erro ao buscar nutricionista padrão:", error);
            // Se não encontrar nutricionista, deixa vazio e será associado depois
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

  async deleteAccount(): Promise<void> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error("Usuário não autenticado");
      }

      const userId = firebaseUser.uid;

      // 1. Deletar documento do usuário no Firestore
      const userDocRef = doc(db, "users", userId);
      await deleteDoc(userDocRef);

      // 2. Deletar conta do Firebase Authentication
      await deleteUser(firebaseUser);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as firebaseError | string);
      throw new Error(message);
    }
  },
};
