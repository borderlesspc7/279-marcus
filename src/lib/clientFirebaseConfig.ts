import { auth, db } from "./firebaseconfig";

// Usar a mesma instância de auth e db do firebaseconfig principal
// Não há necessidade de criar uma instância separada para clientes
// O Firebase Auth suporta múltiplos usuários no mesmo projeto

export const clientAuth = auth;
export const clientDb = db;
export const clientApp = null; // Não usado mais

export default { auth, db };

