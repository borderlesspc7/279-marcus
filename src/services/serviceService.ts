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
import { db } from "../lib/firebaseconfig";
import type { Service, CreateServiceData, UpdateServiceData } from "../types/service";

const SERVICES_COLLECTION = "services";

/**
 * Criar um novo serviço
 */
export const createService = async (
  serviceData: CreateServiceData,
  nutritionistId: string
): Promise<string> => {
  try {
    const serviceDoc = {
      nutritionistId,
      name: serviceData.name,
      duration: serviceData.duration,
      price: serviceData.price,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, SERVICES_COLLECTION), serviceDoc);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    throw error;
  }
};

/**
 * Buscar todos os serviços de um nutricionista
 */
export const getServicesByNutritionist = async (
  nutritionistId: string
): Promise<Service[]> => {
  try {
    const q = query(
      collection(db, SERVICES_COLLECTION),
      where("nutritionistId", "==", nutritionistId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Service;
    });
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    throw error;
  }
};

/**
 * Buscar apenas serviços ativos de um nutricionista
 */
export const getActiveServices = async (
  nutritionistId: string
): Promise<Service[]> => {
  try {
    const q = query(
      collection(db, SERVICES_COLLECTION),
      where("nutritionistId", "==", nutritionistId),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Service;
    });
  } catch (error) {
    console.error("Erro ao buscar serviços ativos:", error);
    throw error;
  }
};

/**
 * Buscar um serviço por ID
 */
export const getServiceById = async (serviceId: string): Promise<Service | null> => {
  try {
    const docRef = doc(db, SERVICES_COLLECTION, serviceId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Service;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    throw error;
  }
};

/**
 * Atualizar um serviço
 */
export const updateService = async (
  serviceId: string,
  data: UpdateServiceData
): Promise<void> => {
  try {
    const docRef = doc(db, SERVICES_COLLECTION, serviceId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    throw error;
  }
};

/**
 * Deletar um serviço
 */
export const deleteService = async (serviceId: string): Promise<void> => {
  try {
    const docRef = doc(db, SERVICES_COLLECTION, serviceId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
    throw error;
  }
};

/**
 * Alternar status ativo/inativo de um serviço
 */
export const toggleServiceStatus = async (
  serviceId: string,
  isActive: boolean
): Promise<void> => {
  try {
    await updateService(serviceId, { isActive });
  } catch (error) {
    console.error("Erro ao alternar status do serviço:", error);
    throw error;
  }
};
