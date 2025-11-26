/**
 * Script para criar um usuário com role "user" no Firebase
 * 
 * Uso:
 *   node scripts/create-user.js
 * 
 * Ou com parâmetros:
 *   node scripts/create-user.js --name "João Silva" --email "joao@example.com" --password "senha123" --phone "(11) 98765-4321"
 */

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, addDoc, query, getDocs, where, Timestamp } from "firebase/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Função para carregar variáveis de ambiente do arquivo .env
function loadEnv() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const envPath = join(__dirname, "../.env");
  
  try {
    const envFile = readFileSync(envPath, "utf-8");
    const envVars = {};
    
    envFile.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
          envVars[key.trim()] = value;
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.warn("⚠️  Arquivo .env não encontrado. Usando variáveis de ambiente do sistema.");
    return {};
  }
}

// Carregar variáveis de ambiente
const env = loadEnv();

// Configuração do Firebase
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
};

// Verificar se as variáveis de ambiente estão configuradas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("❌ Erro: Variáveis de ambiente do Firebase não configuradas!");
  console.error("Certifique-se de que o arquivo .env existe e contém:");
  console.error("  VITE_FIREBASE_API_KEY");
  console.error("  VITE_FIREBASE_AUTH_DOMAIN");
  console.error("  VITE_FIREBASE_PROJECT_ID");
  console.error("  VITE_FIREBASE_STORAGE_BUCKET");
  console.error("  VITE_FIREBASE_MESSAGING_SENDER_ID");
  console.error("  VITE_FIREBASE_APP_ID");
  process.exit(1);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Função para criar usuário
async function createUser(name, email, password, phone = null, role = "user") {
  try {
    console.log("\n🚀 Criando usuário...");
    console.log(`   Nome: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);
    console.log(`   Telefone: ${phone || "Não informado"}`);

    // 1. Criar usuário no Firebase Authentication
    console.log("\n📝 Criando conta no Firebase Authentication...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;
    console.log(`✅ Usuário criado no Authentication: ${firebaseUser.uid}`);

    // 2. Criar registro no Firestore
    console.log("\n💾 Criando registro no Firestore...");
    const userData = {
      uid: firebaseUser.uid,
      name: name,
      email: email,
      phone: phone || null,
      role: role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "users", firebaseUser.uid), userData);
    console.log(`✅ Registro criado no Firestore`);

    // Se o usuário tem role "user", criar automaticamente como cliente
    if (role === "user") {
      try {
        console.log("\n👤 Criando registro de cliente...");
        
        // Buscar um admin/nutricionista padrão para associar o cliente
        let nutritionistId = "";
        try {
          const usersQuery = query(
            collection(db, "users"),
            where("role", "==", "admin")
          );
          const usersSnapshot = await getDocs(usersQuery);
          if (!usersSnapshot.empty) {
            nutritionistId = usersSnapshot.docs[0].id;
            console.log(`   Associado ao nutricionista: ${nutritionistId}`);
          }
        } catch (error) {
          console.warn("   ⚠️  Nenhum admin encontrado, cliente será criado sem nutricionista associado");
        }

        const clientData = {
          fullName: name,
          email: email,
          phone: phone || "",
          birthDate: "",
          gender: "outro",
          height: null,
          weight: null,
          nutritionistId: nutritionistId,
          authUid: firebaseUser.uid,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        await addDoc(collection(db, "clients"), clientData);
        console.log(`✅ Cliente criado automaticamente`);
      } catch (error) {
        console.warn("⚠️  Erro ao criar cliente automaticamente:", error.message);
        console.warn("   O cliente pode ser criado manualmente depois");
      }
    }

    console.log("\n✨ Usuário criado com sucesso!");
    console.log("\n📋 Informações do usuário:");
    console.log(`   UID: ${firebaseUser.uid}`);
    console.log(`   Nome: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: ${role}`);
    console.log(`   Telefone: ${phone || "Não informado"}`);
    console.log("\n🔐 Credenciais de login:");
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log("\n⚠️  IMPORTANTE: Guarde essas credenciais em local seguro!");

    return { success: true, user: userData };
  } catch (error) {
    console.error("\n❌ Erro ao criar usuário:", error.message);
    
    if (error.code === "auth/email-already-in-use") {
      console.error("\n💡 O email já está em uso. Use outro email ou faça login com este.");
    } else if (error.code === "auth/invalid-email") {
      console.error("\n💡 O email fornecido é inválido.");
    } else if (error.code === "auth/weak-password") {
      console.error("\n💡 A senha é muito fraca. Use pelo menos 6 caracteres.");
    }
    
    throw error;
  }
}

// Função para ler argumentos da linha de comando
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    name: null,
    email: null,
    password: null,
    phone: null,
    role: "user",
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace("--", "");
    const value = args[i + 1];

    if (key && value) {
      if (key === "name") params.name = value;
      if (key === "email") params.email = value;
      if (key === "password") params.password = value;
      if (key === "phone") params.phone = value;
      if (key === "role") params.role = value;
    }
  }

  return params;
}

// Função principal
async function main() {
  try {
    const params = parseArgs();

    // Se não foram fornecidos parâmetros, usar valores padrão ou pedir interativamente
    let name = params.name;
    let email = params.email;
    let password = params.password;
    let phone = params.phone;
    let role = params.role || "user";

    // Se não foram fornecidos parâmetros, usar valores de exemplo
    if (!name || !email || !password) {
      console.log("📝 Criando usuário com valores padrão...");
      console.log("💡 Dica: Você pode passar parâmetros:");
      console.log("   node scripts/create-user.js --name \"Nome\" --email \"email@example.com\" --password \"senha123\" --phone \"(11) 98765-4321\"\n");
      
      // Valores padrão para teste
      name = name || "Usuário Teste";
      email = email || `user${Date.now()}@example.com`;
      password = password || "senha123";
      phone = phone || "(11) 98765-4321";
      
      console.log("📋 Usando valores padrão:");
      console.log(`   Nome: ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Senha: ${password}`);
      console.log(`   Telefone: ${phone}`);
      console.log(`   Role: ${role}\n`);
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Email inválido");
    }

    // Validar senha
    if (password.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }

    // Criar usuário
    await createUser(name, email, password, phone, role);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Falha ao executar script:", error.message);
    process.exit(1);
  }
}

// Executar script
main();

