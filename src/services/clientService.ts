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
  Consultation,
  CreateConsultationData,
  UpdateConsultationData,
  ClientGoal,
  CreateClientGoalData,
  UpdateClientGoalData,
} from "../types/client";

const CLIENTS_COLLECTION = "clients";
const NOTES_COLLECTION = "clientNotes";
const DOCUMENTS_COLLECTION = "clientDocuments";
const CONSULTATIONS_COLLECTION = "consultations";
const GOALS_COLLECTION = "clientGoals";

// ========== CRUD DE CLIENTES ==========

export const createClient = async (
  clientData: CreateClientData,
  nutritionistId: string
): Promise<string> => {
  try {
    // 1. Criar conta de acesso no Firebase Auth (instância separada para clientes)
    // Senha inicial = data de nascimento (apenas dígitos, formato DDMMAAAA ou AAAAMMDD)
    // Exemplo: 1990-05-12 -> 12051990
    const birthDigits = clientData.birthDate.replace(/\D/g, "");
    const initialPassword = birthDigits;

    const userCredential = await createUserWithEmailAndPassword(
      clientAuth,
      clientData.email,
      initialPassword
    );

    const clientUid = userCredential.user.uid;

    // 2. Criar registro do cliente no Firestore
    const clientDoc = {
      fullName: clientData.fullName,
      email: clientData.email,
      phone: clientData.phone,
      birthDate: clientData.birthDate,
      gender: clientData.gender,
      height: clientData.height || null,
      weight: clientData.weight || null,
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
    // Buscar todos os clientes e filtrar:
    // 1. Clientes que têm este nutritionistId
    // 2. Clientes que têm authUid mas não têm nutritionistId (ou têm vazio)
    //    (esses são clientes auto-cadastrados que ainda não foram associados)
    const q = query(
      collection(db, CLIENTS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    const clients = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as Client[];

    // Retornar clientes que:
    // 1. Têm este nutritionistId específico, OU
    // 2. Têm authUid mas não têm nutritionistId definido (ou está vazio)
    //    (clientes auto-cadastrados que ainda não foram associados a nenhum nutricionista)
    return clients.filter(
      (client) =>
        client.nutritionistId === nutritionistId ||
        (client.authUid && (!client.nutritionistId || client.nutritionistId.trim() === ""))
    );
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

export const getClientByAuthUid = async (
  authUid: string
): Promise<Client | null> => {
  try {
    const q = query(
      collection(db, CLIENTS_COLLECTION),
      where("authUid", "==", authUid)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const clientDoc = querySnapshot.docs[0];
    return {
      id: clientDoc.id,
      ...clientDoc.data(),
      createdAt: clientDoc.data().createdAt.toDate(),
      updatedAt: clientDoc.data().updatedAt.toDate(),
    } as Client;
  } catch (error) {
    console.error("Erro ao buscar cliente por authUid:", error);
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

// ========== CONSULTAS (HISTÓRICO) ==========

export const createConsultation = async (
  clientId: string,
  nutritionistId: string,
  consultationData: CreateConsultationData
): Promise<string> => {
  try {
    const consultationDoc = {
      clientId,
      nutritionistId,
      date: Timestamp.fromDate(consultationData.date),
      weight: consultationData.weight || null,
      height: consultationData.height || null,
      bodyFat: consultationData.bodyFat || null,
      muscleMass: consultationData.muscleMass || null,
      notes: consultationData.notes || "",
      complaints: consultationData.complaints || "",
      observations: consultationData.observations || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, CONSULTATIONS_COLLECTION), consultationDoc);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar consulta:", error);
    throw error;
  }
};

export const getConsultationsByClient = async (
  clientId: string
): Promise<Consultation[]> => {
  try {
    const q = query(
      collection(db, CONSULTATIONS_COLLECTION),
      where("clientId", "==", clientId)
    );

    const querySnapshot = await getDocs(q);

    const consultations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Consultation[];

    // Ordenar no cliente ao invés do servidor
    return consultations.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Erro ao buscar consultas:", error);
    throw error;
  }
};

export const getConsultationById = async (
  consultationId: string
): Promise<Consultation | null> => {
  try {
    const docRef = doc(db, CONSULTATIONS_COLLECTION, consultationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        date: docSnap.data().date.toDate(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as Consultation;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar consulta:", error);
    throw error;
  }
};

export const updateConsultation = async (
  consultationId: string,
  data: UpdateConsultationData
): Promise<void> => {
  try {
    const docRef = doc(db, CONSULTATIONS_COLLECTION, consultationId);
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar consulta:", error);
    throw error;
  }
};

export const deleteConsultation = async (consultationId: string): Promise<void> => {
  try {
    const docRef = doc(db, CONSULTATIONS_COLLECTION, consultationId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar consulta:", error);
    throw error;
  }
};

export const getConsultationCount = async (clientId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, CONSULTATIONS_COLLECTION),
      where("clientId", "==", clientId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Erro ao contar consultas:", error);
    throw error;
  }
};

// ========== OBJETIVOS ==========

export const createClientGoal = async (
  clientId: string,
  nutritionistId: string,
  goalData: CreateClientGoalData
): Promise<string> => {
  try {
    const goalDoc = {
      clientId,
      nutritionistId,
      title: goalData.title,
      description: goalData.description || "",
      targetValue: goalData.targetValue || null,
      currentValue: goalData.currentValue || null,
      unit: goalData.unit || "",
      status: "active" as const,
      startDate: Timestamp.now(),
      targetDate: goalData.targetDate ? Timestamp.fromDate(goalData.targetDate) : null,
      completedDate: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, GOALS_COLLECTION), goalDoc);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar objetivo:", error);
    throw error;
  }
};

export const getClientGoals = async (
  clientId: string
): Promise<ClientGoal[]> => {
  try {
    const q = query(
      collection(db, GOALS_COLLECTION),
      where("clientId", "==", clientId)
    );

    const querySnapshot = await getDocs(q);

    const goals = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      targetDate: doc.data().targetDate?.toDate(),
      completedDate: doc.data().completedDate?.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as ClientGoal[];

    // Ordenar no cliente ao invés do servidor
    return goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Erro ao buscar objetivos:", error);
    throw error;
  }
};

export const getClientGoalById = async (
  goalId: string
): Promise<ClientGoal | null> => {
  try {
    const docRef = doc(db, GOALS_COLLECTION, goalId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        startDate: docSnap.data().startDate.toDate(),
        targetDate: docSnap.data().targetDate?.toDate(),
        completedDate: docSnap.data().completedDate?.toDate(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as ClientGoal;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar objetivo:", error);
    throw error;
  }
};

export const updateClientGoal = async (
  goalId: string,
  data: UpdateClientGoalData
): Promise<void> => {
  try {
    const docRef = doc(db, GOALS_COLLECTION, goalId);
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    if (data.targetDate) {
      updateData.targetDate = Timestamp.fromDate(data.targetDate);
    }

    if (data.completedDate) {
      updateData.completedDate = Timestamp.fromDate(data.completedDate);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar objetivo:", error);
    throw error;
  }
};

export const deleteClientGoal = async (goalId: string): Promise<void> => {
  try {
    const docRef = doc(db, GOALS_COLLECTION, goalId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar objetivo:", error);
    throw error;
  }
};
