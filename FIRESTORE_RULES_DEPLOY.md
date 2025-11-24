# Deploy das Regras do Firestore

## ⚠️ Problema: "Missing or insufficient permissions"

Se você está recebendo este erro ao tentar buscar agendamentos, é necessário fazer o **deploy das regras atualizadas** do Firestore.

## 🔧 Como Resolver

### Opção 1: Deploy via Firebase CLI (Recomendado)

1. **Instale o Firebase CLI** (se ainda não tiver):
   ```bash
   npm install -g firebase-tools
   ```

2. **Faça login no Firebase**:
   ```bash
   firebase login
   ```

3. **Inicialize o Firebase no projeto** (se ainda não fez):
   ```bash
   firebase init firestore
   ```

4. **Faça o deploy das regras**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Opção 2: Deploy via Console do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Firestore Database** → **Regras**
4. Cole o conteúdo do arquivo `firestore.rules`
5. Clique em **Publicar**

## 📋 Regras Atualizadas

As regras foram atualizadas para permitir:
- ✅ Leitura de agendamentos para usuários autenticados
- ✅ Escrita de agendamentos para usuários autenticados
- ✅ Queries com `where` e `orderBy` na coleção de appointments

## 🔍 Verificações Adicionais

### 1. Verificar Autenticação

Certifique-se de que o usuário está autenticado antes de fazer queries:

```typescript
const { user } = useAuth();
if (!user?.uid) {
  // Não fazer query se não estiver autenticado
  return;
}
```

### 2. Índices Compostos (se necessário)

Se você receber um erro sobre índices faltando, o Firebase vai mostrar um link para criar o índice automaticamente. Clique no link e aguarde a criação do índice.

Os índices necessários para as queries de appointments são:
- `appointments` collection:
  - `nutritionistId` (Ascending) + `date` (Ascending)
  - `clientId` (Ascending) + `date` (Descending)
  - `nutritionistId` (Ascending) + `date` (Ascending) + `status` (Ascending)

### 3. Verificar Regras no Console

Após o deploy, verifique no console do Firebase se as regras foram aplicadas corretamente.

## 🧪 Testar

Após fazer o deploy:

1. Faça login na aplicação
2. Tente acessar a página de Agenda
3. Verifique se os agendamentos são carregados sem erros

## 📝 Nota sobre Segurança

As regras atuais permitem que qualquer usuário autenticado leia e escreva agendamentos. Se você quiser restringir para que cada nutricionista veja apenas seus próprios agendamentos, use estas regras mais restritivas:

```javascript
match /appointments/{appointmentId} {
  // Permite leitura apenas se o usuário é o nutricionista do agendamento
  allow read: if request.auth != null && 
    (resource.data.nutritionistId == request.auth.uid);
  
  // Permite criação se o usuário é o nutricionista
  allow create: if request.auth != null && 
    request.resource.data.nutritionistId == request.auth.uid;
  
  // Permite atualização/deleção apenas se o usuário é o nutricionista
  allow update, delete: if request.auth != null && 
    resource.data.nutritionistId == request.auth.uid;
}
```

**Nota:** Com essas regras mais restritivas, você ainda precisará permitir queries na coleção. Isso pode ser feito adicionando uma regra adicional ou usando as regras atuais que são mais permissivas.

