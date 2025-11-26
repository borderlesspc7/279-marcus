# Deploy das Regras do Firebase Storage

## ⚠️ Problema: Erro de CORS no Upload de Arquivos

Se você está recebendo erros de CORS ao tentar fazer upload de arquivos para o Firebase Storage, é necessário fazer o **deploy das regras de segurança do Storage**.

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
   firebase init storage
   ```
   - Quando perguntado sobre o arquivo de regras, escolha `storage.rules`

4. **Faça o deploy das regras**:
   ```bash
   firebase deploy --only storage
   ```

### Opção 2: Deploy via Console do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Storage** → **Regras**
4. Cole o conteúdo do arquivo `storage.rules`:
   ```javascript
   rules_version = '2';

   service firebase.storage {
     match /b/{bucket}/o {
       match /documents/{clientId}/{fileName} {
         allow read, write: if request.auth != null;
       }
       
       match /{allPaths=**} {
         allow read, write: if false;
       }
     }
   }
   ```
5. Clique em **Publicar**

## 📋 Regras Configuradas

As regras permitem:
- ✅ Upload de documentos de clientes para usuários autenticados
- ✅ Leitura de documentos de clientes para usuários autenticados
- ✅ Acesso negado a todos os outros caminhos por padrão

## 🔍 Verificações Adicionais

### 1. Verificar Autenticação

Certifique-se de que o usuário está autenticado antes de fazer upload:

```typescript
const { user } = useAuth();
if (!user?.uid) {
  // Não fazer upload se não estiver autenticado
  return;
}
```

### 2. Verificar Configuração do Storage

Verifique se o `storageBucket` está configurado corretamente no arquivo `.env`:

```env
VITE_FIREBASE_STORAGE_BUCKET=appnutri-d3bd4.firebasestorage.app
```

### 3. Verificar Regras no Console

Após o deploy, verifique no console do Firebase se as regras foram aplicadas corretamente:
- Vá em **Storage** → **Regras**
- Verifique se as regras estão publicadas

## 🧪 Testar

Após fazer o deploy:

1. Faça login na aplicação
2. Vá para o perfil de um cliente
3. Tente fazer upload de um documento
4. Verifique se o upload é concluído sem erros de CORS

## 📝 Nota sobre Segurança

As regras atuais permitem que qualquer usuário autenticado faça upload e leia documentos de qualquer cliente. Se você quiser restringir para que cada nutricionista veja apenas os documentos de seus próprios clientes, você precisaria:

1. Armazenar o `nutritionistId` nos metadados do arquivo
2. Verificar nas regras se o `nutritionistId` corresponde ao usuário autenticado

Exemplo de regras mais restritivas (requer metadados customizados):

```javascript
match /documents/{clientId}/{fileName} {
  // Permite leitura se o usuário está autenticado
  allow read: if request.auth != null;
  
  // Permite escrita apenas se o usuário está autenticado
  // (A verificação de ownership do cliente deve ser feita no código)
  allow write: if request.auth != null;
}
```

## 🚨 Solução de Problemas

### Erro: "Response to preflight request doesn't pass access control check"

- **Causa**: Regras do Storage não foram deployadas ou estão incorretas
- **Solução**: Faça o deploy das regras seguindo os passos acima

### Erro: "storage/unauthorized"

- **Causa**: Usuário não está autenticado ou regras não permitem acesso
- **Solução**: Verifique se o usuário está logado e se as regras foram deployadas

### Erro: "storage/unknown"

- **Causa**: Problema de conexão ou configuração
- **Solução**: Verifique sua conexão e as configurações do Firebase

