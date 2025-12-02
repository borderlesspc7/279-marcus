/**
 * Script para atualizar a data de término do trial de um usuário admin
 * 
 * Uso:
 *   node scripts/update-trial-date.js --email "admin@example.com" --password "senha123" --days 2
 * 
 * Isso definirá o trialEndDate para 2 dias a partir de hoje
 * 
 * NOTA: É necessário fornecer a senha do usuário para autenticação, pois as regras
 * do Firestore permitem que usuários atualizem apenas seus próprios documentos.
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, Timestamp, collection, query, where, getDocs } from "firebase/firestore";
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
  process.exit(1);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Função para atualizar trialEndDate
async function updateTrialDate(email, password, daysFromNow) {
  try {
    console.log("\n🔐 Autenticando usuário...");
    console.log(`   Email: ${email}`);
    
    // Primeiro, autenticar o usuário
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(`✅ Autenticado como: ${userCredential.user.email}`);
    } catch (authError) {
      if (authError.code === "auth/user-not-found") {
        throw new Error(`Usuário com email ${email} não encontrado no Firebase Authentication`);
      } else if (authError.code === "auth/wrong-password") {
        throw new Error("Senha incorreta. Por favor, forneça a senha correta.");
      } else if (authError.code === "auth/invalid-email") {
        throw new Error("Email inválido.");
      } else {
        throw new Error(`Erro de autenticação: ${authError.message}`);
      }
    }
    
    const firebaseUser = userCredential.user;
    
    // Buscar dados do usuário no Firestore
    console.log("\n🔍 Buscando dados do usuário no Firestore...");
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      throw new Error(`Dados do usuário não encontrados no Firestore`);
    }
    
    const userData = userDocSnap.data();
    
    if (userData.role !== "admin") {
      throw new Error("Usuário não é admin. Apenas admins têm trial.");
    }
    
    console.log(`✅ Usuário encontrado: ${userData.name} (${firebaseUser.uid})`);
    
    // Calcular nova data de término do trial
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + daysFromNow);
    
    console.log(`\n📅 Atualizando trialEndDate...`);
    console.log(`   Data atual: ${new Date().toLocaleDateString("pt-BR")}`);
    console.log(`   Nova data de término: ${trialEndDate.toLocaleDateString("pt-BR")}`);
    console.log(`   Dias restantes: ${daysFromNow}`);
    
    // Atualizar no Firestore (agora autenticado, pode atualizar seu próprio documento)
    await setDoc(
      userDocRef,
      {
        trialEndDate: Timestamp.fromDate(trialEndDate),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    
    console.log("\n✅ TrialEndDate atualizado com sucesso!");
    console.log("\n💡 Para visualizar o banner:");
    console.log("   1. Faça login com este usuário no sistema");
    console.log("   2. O banner aparecerá no topo da página se faltarem 3 dias ou menos");
    console.log(`   3. Atualmente faltam ${daysFromNow} dia(s) - ${daysFromNow <= 3 ? "✅ Banner deve aparecer" : "❌ Banner não aparecerá (precisa ser ≤ 3 dias)"}`);
    
    return { success: true };
  } catch (error) {
    console.error("\n❌ Erro ao atualizar trialEndDate:", error.message);
    throw error;
  }
}

// Função para ler argumentos da linha de comando
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    email: null,
    password: null,
    days: 3,
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace("--", "");
    const value = args[i + 1];

    if (key && value) {
      if (key === "email") params.email = value;
      if (key === "password") params.password = value;
      if (key === "days") params.days = parseInt(value, 10);
    }
  }

  return params;
}

// Função principal
async function main() {
  try {
    const params = parseArgs();
    
    if (!params.email) {
      console.error("❌ Erro: Email é obrigatório!");
      console.error("\nUso:");
      console.error("  node scripts/update-trial-date.js --email \"admin@example.com\" --password \"senha123\" --days 2");
      console.error("\nParâmetros:");
      console.error("  --email:    Email do usuário admin");
      console.error("  --password: Senha do usuário admin (necessária para autenticação)");
      console.error("  --days:     Número de dias até a expiração (padrão: 3)");
      console.error("\n⚠️  NOTA: A senha é necessária porque as regras do Firestore");
      console.error("         permitem que usuários atualizem apenas seus próprios documentos.");
      process.exit(1);
    }
    
    if (!params.password) {
      console.error("❌ Erro: Senha é obrigatória!");
      console.error("\nA senha é necessária para autenticar o usuário e permitir a atualização.");
      console.error("As regras do Firestore só permitem que usuários atualizem seus próprios documentos.");
      process.exit(1);
    }
    
    await updateTrialDate(params.email, params.password, params.days);
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Falha ao executar script:", error.message);
    process.exit(1);
  }
}

// Executar script
main();

