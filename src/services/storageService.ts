import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebaseconfig";

/**
 * Faz upload de um arquivo para o Firebase Storage
 * @param file - Arquivo a ser enviado
 * @param path - Caminho no storage (ex: "documents/clientId/filename.pdf")
 * @returns URL de download do arquivo
 */
export const uploadFile = async (
  file: File,
  path: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    throw error;
  }
};

