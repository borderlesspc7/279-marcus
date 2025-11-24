# Guia de Importação de Alimentos da TACO

Este documento explica como importar os alimentos da Tabela Brasileira de Composição de Alimentos (TACO) para o banco de dados Firestore.

## 📋 Visão Geral

O sistema foi configurado para **não armazenar dados de alimentos no código**. Todos os alimentos devem ser importados para o Firestore através de scripts de importação.

## 🗂️ Estrutura de Arquivos

```
src/
├── services/
│   └── foodService.ts          # Funções CRUD + importação em lote
├── scripts/
│   └── importTacoFoods.ts      # Script de importação da TACO
├── data/
│   └── taco-foods-template.json # Template de dados
└── pages/
    └── Admin/
        └── ImportTacoFoods.tsx  # Interface web para importação
```

## 🚀 Como Importar Alimentos

### Opção 1: Interface Web (Recomendado)

1. **Acesse a página de importação** (adicione a rota no seu sistema de rotas):
   ```tsx
   import { ImportTacoFoods } from "./pages/Admin/ImportTacoFoods";
   ```

2. **Prepare os dados**:
   - Extraia os dados nutricionais do PDF TACO
   - Organize no formato JSON (veja `src/data/taco-foods-template.json`)

3. **Importe**:
   - Cole o JSON no campo de texto
   - Clique em "Validar JSON" para verificar
   - Clique em "Importar para o Banco de Dados"

### Opção 2: Script Programático

```typescript
import { importTacoFoods } from "./scripts/importTacoFoods";

const tacoFoods = [
  {
    name: "Abacate, cru",
    category: "Frutas",
    calories: 96,
    protein: 1.2,
    carbs: 6.0,
    fat: 8.4,
    fiber: 6.3,
    unit: "gramas",
    allowedMeals: ["cafe-manha", "lanche"]
  },
  // ... mais alimentos
];

const result = await importTacoFoods(tacoFoods, {
  skipDuplicates: true,      // Ignora duplicados
  batchSize: 500,            // Processa em lotes de 500
  autoFillAllowedMeals: true // Preenche allowedMeals automaticamente
});

console.log(result);
// {
//   total: 100,
//   imported: 95,
//   skipped: 5,
//   errors: 0,
//   errorDetails: []
// }
```

## 📝 Formato dos Dados

Cada alimento deve seguir esta estrutura:

```json
{
  "name": "Nome do alimento",
  "category": "Categoria (ex: Frutas, Proteínas, etc.)",
  "calories": 100,      // kcal por 100g
  "protein": 10.0,      // g por 100g
  "carbs": 20.0,        // g por 100g
  "fat": 5.0,          // g por 100g
  "fiber": 3.0,        // g por 100g (opcional)
  "unit": "gramas",     // "gramas" ou "unidades"
  "unitWeight": 50,    // obrigatório se unit = "unidades"
  "allowedMeals": ["cafe-manha", "almoco", "lanche", "jantar"] // opcional
}
```

### Campos Obrigatórios

- `name`: Nome do alimento
- `category`: Categoria do alimento
- `calories`: Calorias por 100g (número)
- `protein`: Proteína por 100g (número)
- `carbs`: Carboidratos por 100g (número)
- `fat`: Gordura por 100g (número)
- `unit`: "gramas" ou "unidades"

### Campos Opcionais

- `fiber`: Fibra por 100g (número)
- `unitWeight`: Peso de uma unidade em gramas (obrigatório se `unit = "unidades"`)
- `allowedMeals`: Array de refeições permitidas. Se omitido, será preenchido automaticamente baseado na categoria

## 🔍 Validação

O sistema valida automaticamente:

- ✅ Nome não vazio
- ✅ Categoria não vazia
- ✅ Valores numéricos válidos (não negativos)
- ✅ Unidade válida ("gramas" ou "unidades")
- ✅ `unitWeight` presente quando `unit = "unidades"`

## 📊 Categorias e AllowedMeals Padrão

O sistema preenche automaticamente `allowedMeals` baseado na categoria:

| Categoria | AllowedMeals Padrão |
|-----------|---------------------|
| Frutas | `["cafe-manha", "lanche"]` |
| Proteínas/Carnes/Peixes | `["almoco", "jantar"]` |
| Leguminosas | `["almoco", "jantar"]` |
| Carboidratos | `["almoco", "jantar"]` |
| Laticínios | `["cafe-manha", "lanche"]` |
| Outros | `["cafe-manha", "almoco", "lanche", "jantar"]` |

## ⚙️ Funções Disponíveis

### `importFoodsBatch`

Importa alimentos em lote para o Firestore.

```typescript
import { importFoodsBatch } from "./services/foodService";

const result = await importFoodsBatch(foods, skipDuplicates, batchSize);
```

**Parâmetros:**
- `foods`: Array de alimentos para importar
- `skipDuplicates`: Se `true`, ignora alimentos duplicados (padrão: `true`)
- `batchSize`: Tamanho do lote para processamento (padrão: `500`)

### `importTacoFoods`

Importa alimentos da TACO com validação e preenchimento automático.

```typescript
import { importTacoFoods } from "./scripts/importTacoFoods";

const result = await importTacoFoods(tacoFoods, options);
```

**Opções:**
- `skipDuplicates`: Ignora duplicados (padrão: `true`)
- `batchSize`: Tamanho do lote (padrão: `500`)
- `autoFillAllowedMeals`: Preenche allowedMeals automaticamente (padrão: `true`)

### `validateTacoFoods`

Valida um array de alimentos antes da importação.

```typescript
import { validateTacoFoods } from "./scripts/importTacoFoods";

const { valid, invalid } = validateTacoFoods(foods);
```

## 📚 Extraindo Dados do PDF TACO

Para extrair os dados do PDF TACO:

1. **Abra o PDF** `public/taco_4_edicao_ampliada_e_revisada.pdf`
2. **Para cada alimento**, extraia:
   - Nome completo
   - Categoria
   - Valores nutricionais (por 100g):
     - Energia (kcal)
     - Proteína (g)
     - Carboidrato (g)
     - Lipídios/Gordura (g)
     - Fibra alimentar (g) - se disponível
3. **Organize no formato JSON** conforme o template

### Exemplo de Extração

Do PDF TACO:
```
Abacate, cru
Energia: 96 kcal
Proteína: 1,2 g
Carboidrato: 6,0 g
Lipídios: 8,4 g
Fibra alimentar: 6,3 g
```

Para JSON:
```json
{
  "name": "Abacate, cru",
  "category": "Frutas",
  "calories": 96,
  "protein": 1.2,
  "carbs": 6.0,
  "fat": 8.4,
  "fiber": 6.3,
  "unit": "gramas"
}
```

## 🔒 Segurança

- A importação requer autenticação (conforme `firestore.rules`)
- Alimentos duplicados são automaticamente ignorados (baseado no nome)
- Validação rigorosa antes da importação
- Processamento em lotes para evitar sobrecarga

## 📝 Notas Importantes

1. **Não há mais dados hardcoded** - Todos os alimentos devem ser importados
2. **Duplicatas são ignoradas** - Alimentos com o mesmo nome (normalizado) são pulados
3. **Processamento em lotes** - Grandes volumes são processados em lotes de 500
4. **Validação automática** - Dados inválidos são rejeitados antes da importação

## 🐛 Troubleshooting

### Erro: "Nome do alimento é obrigatório"
- Verifique se o campo `name` está presente e não vazio

### Erro: "unitWeight é obrigatório quando unit é 'unidades'"
- Se `unit = "unidades"`, você deve fornecer `unitWeight`

### Alimentos não aparecem após importação
- Verifique se há erros na importação
- Confirme que você está autenticado
- Verifique as regras do Firestore

### Importação muito lenta
- Reduza o `batchSize` se houver problemas de performance
- Verifique a conexão com o Firestore

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Revise a validação dos dados
3. Confirme as permissões do Firestore

