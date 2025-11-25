# 🔍 Como Verificar se os Alimentos Estão Sendo Buscados do Firestore

Este guia ajuda você a confirmar que o sistema está buscando alimentos do Firestore e não de arquivos JSON locais.

## ✅ Verificações Automáticas no Código

### 1. Verificar que não há importações de JSON
O código **NÃO** importa arquivos JSON locais. Você pode confirmar isso procurando por:
- ❌ `import ... from './data/taco-foods-complete.json'` - **NÃO existe**
- ❌ `require('./data/taco-foods-complete.json')` - **NÃO existe**
- ✅ `getFoods()` do `foodService` - **EXISTE e busca do Firestore**

### 2. Verificar o Console do Navegador

Quando você criar uma nova dieta e buscar alimentos, você verá logs como:

```
[getFoods] 🔍 Buscando alimentos do FIRESTORE (coleção: foods)
[getFoods] Parâmetros: searchTerm="arroz", mealType="almoco", limit=100
[getFoods] ✅ Total de alimentos encontrados no FIRESTORE: 150
[FoodSearch] 🔍 Iniciando busca de alimentos do FIRESTORE...
[FoodSearch] ✅ Busca concluída: "arroz", Refeição: almoco, Resultados do FIRESTORE: 5
```

**Se você ver essas mensagens com "FIRESTORE"**, está funcionando corretamente! ✅

### 3. Verificar a Aba Network (Rede) do DevTools

1. Abra o DevTools do navegador (F12)
2. Vá para a aba **Network** (Rede)
3. Filtre por **Firestore** ou **firestore.googleapis.com**
4. Ao buscar um alimento, você verá requisições para o Firestore

**Exemplo de requisição esperada:**
```
POST https://firestore.googleapis.com/v1/projects/SEU_PROJETO/databases/(default)/documents:runQuery
```

### 4. Teste Prático

1. **Abra a Calculadora de Dieta** (`/dashboard/dietas/calcular`)
2. **Selecione uma refeição** (ex: Almoço)
3. **Digite um alimento** na busca (ex: "arroz")
4. **Abra o Console** (F12 → Console)
5. **Verifique os logs** - você deve ver:
   - `[getFoods] 🔍 Buscando alimentos do FIRESTORE`
   - `[getFoods] ✅ Total de alimentos encontrados no FIRESTORE: X`
   - `[FoodSearch] ✅ Busca concluída... Resultados do FIRESTORE: X`

### 5. Verificar no Firestore Console

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Vá para **Firestore Database**
3. Verifique a coleção **`foods`**
4. Confirme que há alimentos cadastrados lá
5. Os alimentos que aparecem na busca devem estar nesta coleção

## 🚨 Sinais de que NÃO está funcionando

Se você ver:
- ❌ Erros de "Cannot read property 'map' of undefined" sem logs do Firestore
- ❌ Mensagens sobre arquivos JSON não encontrados
- ❌ Nenhuma requisição para firestore.googleapis.com na aba Network
- ❌ Logs mencionando "arquivo local" ou "JSON"

**Nesse caso, verifique:**
1. Se os alimentos foram importados para o Firestore
2. Se as regras do Firestore permitem leitura
3. Se a configuração do Firebase está correta

## 📝 Resumo

O sistema está configurado para:
- ✅ Buscar alimentos do **Firestore** (coleção `foods`)
- ✅ Usar `getFoods()` do `foodService.ts`
- ✅ Filtrar por tipo de refeição
- ✅ Fazer busca por nome/categoria
- ❌ **NÃO** usar arquivos JSON locais

Os logs no console confirmarão isso quando você usar a calculadora de dieta!

