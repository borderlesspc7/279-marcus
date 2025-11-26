import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebaseconfig";
import { auth } from "../lib/firebaseconfig";

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
    // Verificar se o usuário está autenticado
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Usuário não autenticado. Faça login para fazer upload de arquivos.");
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("Arquivo muito grande. O tamanho máximo permitido é 10MB.");
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Tipo de arquivo não permitido. Use PDF, JPG, PNG ou DOC/DOCX."
      );
    }

    const storageRef = ref(storage, path);
    
    // Fazer upload com metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: user.uid,
        uploadedAt: new Date().toISOString(),
      },
    };

    await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error("Erro ao fazer upload do arquivo:", error);
    
    // Tratar erros específicos
    if (error.code === "storage/unauthorized") {
      throw new Error(
        "Acesso negado. Verifique as regras de segurança do Firebase Storage."
      );
    } else if (error.code === "storage/canceled") {
      throw new Error("Upload cancelado.");
    } else if (error.code === "storage/unknown") {
      throw new Error(
        "Erro desconhecido ao fazer upload. Verifique sua conexão e tente novamente."
      );
    } else if (error.message) {
      throw error;
    } else {
      throw new Error("Erro ao fazer upload do arquivo. Tente novamente.");
    }
  }
};

