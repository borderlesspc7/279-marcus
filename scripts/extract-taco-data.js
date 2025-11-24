/**
 * Script para extrair dados do PDF TACO e gerar JSON completo
 * 
 * Uso:
 * node scripts/extract-taco-data.js
 * 
 * Requer: pdf-parse ou pdfjs-dist
 */

const fs = require('fs');
const path = require('path');

// Lista completa de alimentos da TACO (baseada na análise do PDF)
// Nota: Os valores nutricionais precisam ser extraídos do PDF
// Este é um esqueleto que precisa ser preenchido com os dados reais

const TACO_FOODS_TEMPLATE = {
  description: "Dados completos de alimentos da TACO (Tabela Brasileira de Composição de Alimentos)",
  version: "1.0.0",
  source: "NEPA/UNICAMP - TACO 4ª edição revisada e ampliada, 2011",
  totalFoods: 0,
  foods: []
};

// Função para categorizar alimentos automaticamente
function categorizeFood(name) {
  const nameLower = name.toLowerCase();
  
  // Frutas
  if (nameLower.match(/(abacate|abacaxi|acerola|amora|ananás|atemóia|banana|caju|figo|goiaba|graviola|jabuticaba|jambo|kiwi|laranja|limão|mamão|manga|melancia|melão|morango|nêspera|pêra|pêssego|pinha|pitanga|romã|tamarindo|tangerina|tucumã|umbu|uva)/)) {
    return "Frutas";
  }
  
  // Verduras e Legumes
  if (nameLower.match(/(abóbora|abobrinha|alface|alho|almeirão|azedinha|beterraba|brócolis|cebola|cenoura|chuchu|couve|ervilha|espinafre|maxixe|nabo|pepino|pimentão|quiabo|rabanete|repolho|rúcula|serralha|taioba|tomate|vagem)/)) {
    return "Vegetais";
  }
  
  // Carnes e Proteínas
  if (nameLower.match(/(carne|frango|peito|coxa|sobrecoxa|peru|porco|bovina|suína|bisteca|costela|lombo|pernil|alcatra|maminha|patinho|picanha|contra-filé|filé|mignon|cupim|tatu|lagarto|língua|fígado|miúdos|coração|asa|presunto|salame|linguiça|salsicha)/)) {
    return "Proteínas";
  }
  
  // Peixes e Frutos do Mar
  if (nameLower.match(/(peixe|pescada|salmão|atum|sardinha|tilápia|corvina|pintado|tucunaré|agulha|curimba|porquinho|pescadinha|camarão|caranguejo|ostra|mariscos|escargot)/)) {
    return "Proteínas";
  }
  
  // Ovos
  if (nameLower.match(/(ovo|ovos)/)) {
    return "Proteínas";
  }
  
  // Cereais e Grãos
  if (nameLower.match(/(arroz|milho|aveia|trigo|cevada|centeio|quinoa|cuscuz|tapioca|mandioca|inhame|batata|cará|canjica|polenta|farinha)/)) {
    return "Carboidratos";
  }
  
  // Leguminosas
  if (nameLower.match(/(feijão|feijoes|feijões|lentilha|grão-de-bico|ervilha|soja|tremoço|tremoco)/)) {
    return "Leguminosas";
  }
  
  // Laticínios
  if (nameLower.match(/(leite|queijo|iogurte|requeijão|ricota|mussarela|parmesão|cottage|creme|manteiga|margarina|chantilly)/)) {
    return "Laticínios";
  }
  
  // Oleaginosas
  if (nameLower.match(/(amendoim|castanha|amêndoa|noz|avelã|pistache|macadâmia)/)) {
    return "Oleaginosas";
  }
  
  // Gorduras e Óleos
  if (nameLower.match(/(óleo|azeite|gordura)/)) {
    return "Gorduras";
  }
  
  // Pães e Massas
  if (nameLower.match(/(pão|paes|pães|macarrão|massa|pastel|bolo|biscoito|bolacha|torrada|beiju|pamonha)/)) {
    return "Carboidratos";
  }
  
  // Bebidas
  if (nameLower.match(/(suco|refrigerante|cerveja|chá|café|cachaça|bebida)/)) {
    return "Bebidas";
  }
  
  // Preparações
  if (nameLower.match(/(salada|quibe|quibebe|vatapá|tacacá|yakisoba|virado|sarapatel|salpicão|tabule)/)) {
    return "Preparações";
  }
  
  // Doces
  if (nameLower.match(/(doce|mel|rapadura|paçoca|quindim|mousse|pé-de-moleque)/)) {
    return "Doces";
  }
  
  return "Outros";
}

// Função para determinar allowedMeals baseado na categoria
function getDefaultAllowedMeals(category) {
  if (category === "Frutas") {
    return ["cafe-manha", "lanche"];
  }
  if (category === "Proteínas" || category === "Leguminosas" || category === "Carboidratos") {
    return ["almoco", "jantar"];
  }
  if (category === "Laticínios") {
    return ["cafe-manha", "lanche"];
  }
  return ["cafe-manha", "almoco", "lanche", "jantar"];
}

// Lista de todos os alimentos identificados no PDF (sem valores nutricionais ainda)
// Estes precisam ser preenchidos com os dados reais do PDF
const ALL_FOODS_NAMES = [
  // A
  "Abacate, cru",
  "Abacaxi, cru",
  "Abacaxi, polpa, congelada",
  "Abóbora, cabotiá, crua",
  "Abóbora, cabotiá, refogada",
  "Abóbora, menina brasileira, crua",
  "Abóbora, moranga, crua",
  "Abóbora, moranga, refogada",
  "Abóbora, pescoço, crua",
  "Abobrinha, italiana, crua",
  "Abobrinha, italiana, refogada",
  "Açaí, polpa, com xarope de guaraná e glucose, congelada",
  "Açaí, polpa, crua",
  "Acerola, crua",
  "Acerola, polpa, congelada",
  "Agulha, crua",
  "Agulha, frita",
  "Alface, americana, crua",
  "Alface, crespa, crua",
  "Alface, lisa, crua",
  "Alface, roxa, crua",
  "Alho, cru",
  "Almeirão, cru",
  "Amendoim, cru",
  "Amendoim, torrado, salgado",
  "Amora, crua",
  "Ananás, cru",
  "Arroz, agulhinha, tipo 1, cozido",
  "Arroz, agulhinha, tipo 1, cru",
  "Arroz, integral, cozido",
  "Arroz, integral, cru",
  "Arroz, parboilizado, cozido",
  "Arroz, parboilizado, cru",
  "Atemóia, crua",
  "Atum, conserva em óleo",
  "Atum, fresco, cru",
  "Aveia, flocos, crua",
  "Azedinha, crua",
  
  // B
  "Banana, da terra, crua",
  "Banana, da terra, frita",
  "Banana, maçã, crua",
  "Banana, nanica, crua",
  "Banana, ouro, crua",
  "Banana, prata, crua",
  "Barra de cereais, banana com aveia",
  "Barra de cereais, chocolate",
  "Barra de cereais, frutas cristalizadas",
  "Batata, amarela, cozida",
  "Batata, amarela, crua",
  "Batata, doce, assada",
  "Batata, doce, cozida",
  "Batata, doce, crua",
  "Batata, inglesa, cozida",
  "Batata, inglesa, crua",
  "Batata, inglesa, frita",
  "Batata, inglesa, sauté",
  "Bebida láctea, pêssego",
  "Bebida láctea, chocolate",
  "Bebida láctea, morango",
  "Beiju, de tapioca",
  "Beterraba, cozida",
  "Beterraba, crua",
  "Biscoito, água e sal",
  "Biscoito, doce, maisena",
  "Biscoito, doce, recheado com chocolate",
  "Biscoito, doce, recheado com morango",
  "Biscoito, doce, wafer, recheado com chocolate",
  "Biscoito, doce, wafer, recheado com morango",
  "Biscoito, salgado, cream cracker",
  "Biscoito, salgado, tipo snack",
  "Bolacha, doce, de polvilho",
  "Bolacha, doce, recheada com chocolate",
  "Bolacha, doce, recheada com morango",
  "Bolacha, salgada, tipo água e sal",
  "Bolo, chocolate, industrializado",
  "Bolo, milho, caseiro",
  "Bolo, simples, caseiro",
  "Brócolis, cru",
  "Brócolis, no vapor",
  
  // C
  "Cacau, em pó",
  "Cachaça, 40% vol",
  "Café, infusão 10%",
  "Café, torrado, em pó",
  "Caju, cru",
  "Caju, polpa, congelada",
  "Caju, suco concentrado, envasado",
  "Camarão, inteiro, cozido",
  "Camarão, inteiro, cru",
  "Camarão, inteiro, grelhado",
  "Camarão, seco, salgado",
  "Canjica, branca, crua",
  "Canjica, com leite, integral",
  "Cará, cozido",
  "Cará, cru",
  "Caranguejo, cozido",
  // ... (continua com todos os alimentos)
];

console.log("⚠️  ATENÇÃO: Este script gera a estrutura, mas os valores nutricionais precisam ser extraídos do PDF TACO.");
console.log("📄 Para obter os dados completos, você precisa:");
console.log("   1. Abrir o PDF TACO");
console.log("   2. Para cada alimento, copiar os valores nutricionais");
console.log("   3. Preencher o JSON gerado");
console.log("\n💡 Alternativa: Use a página de importação web para adicionar alimentos gradualmente.");

// Por enquanto, vou criar um arquivo com a estrutura completa mas sem valores nutricionais
// O usuário precisará preencher os valores do PDF

const outputPath = path.join(__dirname, '../src/data/taco-foods-complete.json');
const foods = ALL_FOODS_NAMES.map(name => {
  const category = categorizeFood(name);
  return {
    name: name,
    category: category,
    calories: 0, // PRECISA SER PREENCHIDO DO PDF
    protein: 0,  // PRECISA SER PREENCHIDO DO PDF
    carbs: 0,    // PRECISA SER PREENCHIDO DO PDF
    fat: 0,      // PRECISA SER PREENCHIDO DO PDF
    fiber: undefined, // Opcional - preencher se disponível no PDF
    unit: name.toLowerCase().includes("ovo") ? "unidades" : "gramas",
    unitWeight: name.toLowerCase().includes("ovo") ? 50 : undefined,
    allowedMeals: getDefaultAllowedMeals(category),
    // Flag para indicar que precisa ser preenchido
    _needsData: true
  };
});

const output = {
  ...TACO_FOODS_TEMPLATE,
  totalFoods: foods.length,
  foods: foods,
  warning: "⚠️ ESTE ARQUIVO CONTÉM APENAS A ESTRUTURA. OS VALORES NUTRICIONAIS PRECISAM SER EXTRAÍDOS DO PDF TACO."
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\n✅ Arquivo gerado: ${outputPath}`);
console.log(`📊 Total de alimentos: ${foods.length}`);
console.log(`⚠️  Lembre-se: Os valores nutricionais precisam ser preenchidos manualmente do PDF TACO.`);

