# Scripts do Projeto

## Script de Criação de Usuário

### Descrição
Script para criar usuários no Firebase Authentication e Firestore com role "user" ou "admin".

### Uso

#### 1. Com valores padrão (geração automática)
```bash
npm run create-user
```

Isso criará um usuário com:
- Nome: "Usuário Teste"
- Email: `user{timestamp}@example.com`
- Senha: "senha123"
- Telefone: "(11) 98765-4321"
- Role: "user"

#### 2. Com parâmetros personalizados
```bash
npm run create-user -- --name "João Silva" --email "joao@example.com" --password "senha123" --phone "(11) 98765-4321"
```

#### 3. Criar usuário admin
```bash
npm run create-user -- --name "Admin" --email "admin@example.com" --password "admin123" --role "admin"
```

### Parâmetros

- `--name`: Nome completo do usuário (obrigatório)
- `--email`: Email do usuário (obrigatório)
- `--password`: Senha do usuário (obrigatório, mínimo 6 caracteres)
- `--phone`: Telefone do usuário (opcional)
- `--role`: Role do usuário - "user" ou "admin" (padrão: "user")

### Exemplos

#### Criar usuário comum
```bash
npm run create-user -- --name "Maria Santos" --email "maria@example.com" --password "senha123"
```

#### Criar usuário admin
```bash
npm run create-user -- --name "Administrador" --email "admin@example.com" --password "admin123" --role "admin"
```

#### Criar usuário com telefone
```bash
npm run create-user -- --name "Pedro Costa" --email "pedro@example.com" --password "senha123" --phone "(11) 98765-4321"
```

### Requisitos

1. Arquivo `.env` na raiz do projeto com as variáveis do Firebase:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

2. Firebase configurado e acessível

### Saída

O script exibirá:
- ✅ Confirmação de criação no Firebase Authentication
- ✅ Confirmação de criação no Firestore
- 📋 Informações do usuário criado (UID, nome, email, role)
- 🔐 Credenciais de login (email e senha)

### Tratamento de Erros

O script trata os seguintes erros:
- Email já em uso
- Email inválido
- Senha muito fraca
- Variáveis de ambiente não configuradas

### Notas

- ⚠️ **IMPORTANTE**: Guarde as credenciais geradas em local seguro
- O script cria o usuário tanto no Firebase Authentication quanto no Firestore
- O role padrão é "user", mas pode ser alterado para "admin"
- O telefone é opcional

