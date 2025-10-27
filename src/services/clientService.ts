import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../lib/firebaseconfig";
import { clientAuth } from "../lib/clientFirebaseConfig";
import type {
  Client,
  CreateClientData,
  ClientNote,
  ClientDocument,
} from "../types/client";

const CLIENTS_COLLECTION = "clients";
const NOTES_COLLECTION = "clientNotes";
const DOCUMENTS_COLLECTION = "clientDocuments";

// ========== CRUD DE CLIENTES ==========

export const createClient = async (
  clientData: CreateClientData,
  nutritionistId: string
): Promise<string> => {
  try {
    // 1. Criar conta de acesso no Firebase Auth (instância separada para clientes)
    // Gera senha temporária aleatória
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!";

    const userCredential = await createUserWithEmailAndPassword(
      clientAuth,
      clientData.email,
      tempPassword
    );

    const clientUid = userCredential.user.uid;

    // 2. Criar registro do cliente no Firestore
    const clientDoc = {
      fullName: clientData.fullName,
      email: clientData.email,
      phone: clientData.phone,
      birthDate: clientData.birthDate,
      gender: clientData.gender,
      nutritionistId,
      authUid: clientUid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), clientDoc);

    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    throw error;
  }
};

export const getClientsByNutritionist = async (
  nutritionistId: string
): Promise<Client[]> => {
  try {
    const q = query(
      collection(db, CLIENTS_COLLECTION),
      where("nutritionistId", "==", nutritionistId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Client[];
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    throw error;
  }
};

export const getClientById = async (
  clientId: string
): Promise<Client | null> => {
  try {
    const docRef = doc(db, CLIENTS_COLLECTION, clientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as Client;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    throw error;
  }
};

export const updateClient = async (
  clientId: string,
  data: Partial<CreateClientData>
): Promise<void> => {
  try {
    const docRef = doc(db, CLIENTS_COLLECTION, clientId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    throw error;
  }
};

export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    const docRef = doc(db, CLIENTS_COLLECTION, clientId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    throw error;
  }
};

// ========== ANOTAÇÕES ==========

export const addClientNote = async (
  clientId: string,
  content: string
): Promise<string> => {
  try {
    const noteDoc = {
      clientId,
      content,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, NOTES_COLLECTION), noteDoc);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar nota:", error);
    throw error;
  }
};

export const getClientNotes = async (
  clientId: string
): Promise<ClientNote[]> => {
  try {
    const q = query(
      collection(db, NOTES_COLLECTION),
      where("clientId", "==", clientId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as ClientNote[];
  } catch (error) {
    console.error("Erro ao buscar notas:", error);
    throw error;
  }
};

export const updateClientNote = async (
  noteId: string,
  content: string
): Promise<void> => {
  try {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    await updateDoc(docRef, {
      content,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao atualizar nota:", error);
    throw error;
  }
};

export const deleteClientNote = async (noteId: string): Promise<void> => {
  try {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar nota:", error);
    throw error;
  }
};

// ========== DOCUMENTOS ==========

export const addClientDocument = async (
  clientId: string,
  name: string,
  type: "exame-sangue" | "bioimpedancia" | "outro",
  fileUrl: string
): Promise<string> => {
  try {
    const docData = {
      clientId,
      name,
      type,
      fileUrl,
      uploadedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), docData);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar documento:", error);
    throw error;
  }
};

export const getClientDocuments = async (
  clientId: string
): Promise<ClientDocument[]> => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where("clientId", "==", clientId),
      orderBy("uploadedAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt.toDate(),
    })) as ClientDocument[];
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    throw error;
  }
};

export const deleteClientDocument = async (docId: string): Promise<void> => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    throw error;
  }
};
