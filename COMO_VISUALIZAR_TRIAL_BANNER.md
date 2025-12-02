# Como Visualizar o TrialWarningBanner

O `TrialWarningBanner` aparece automaticamente quando:
- ✅ Usuário está logado como **admin**
- ✅ Usuário tem `trialEndDate` configurado
- ✅ Faltam **3 dias ou menos** para o trial expirar

## Opções para Visualizar

### Opção 1: Usar o Script (Recomendado)

Use o script `update-trial-date.js` para atualizar a data de término do trial de um usuário admin:

```bash
node scripts/update-trial-date.js --email "seu-email@admin.com" --password "sua-senha" --days 2
```

**Parâmetros:**
- `--email`: Email do usuário admin
- `--password`: Senha do usuário admin (necessária para autenticação)
- `--days`: Número de dias até a expiração (use 1, 2 ou 3 para ver o banner)

**⚠️ Nota:** A senha é necessária porque as regras do Firestore permitem que usuários atualizem apenas seus próprios documentos. O script precisa autenticar o usuário para fazer a atualização.

**Exemplos:**
```bash
# Para ver o banner com 2 dias restantes
node scripts/update-trial-date.js --email "admin@example.com" --password "senha123" --days 2

# Para ver o banner com 1 dia restante (expira amanhã)
node scripts/update-trial-date.js --email "admin@example.com" --password "senha123" --days 1

# Para ver o banner expirando hoje
node scripts/update-trial-date.js --email "admin@example.com" --password "senha123" --days 0
```

Depois:
1. Faça login com o usuário admin no sistema
2. O banner aparecerá no topo da página (logo abaixo do header)

### Opção 2: Atualizar Manualmente no Firestore

1. Acesse o [Console do Firebase](https://console.firebase.google.com)
2. Vá em **Firestore Database**
3. Encontre o documento do usuário na coleção `users`
4. Edite o campo `trialEndDate` e defina para uma data 1-3 dias no futuro
5. Faça login no sistema

### Opção 3: Criar Novo Usuário Admin com Trial Próximo

Se você não tem um admin ainda, crie um novo:

```bash
node scripts/create-user.js --name "Admin Teste" --email "admin-teste@example.com" --password "senha123" --role "admin"
```

Depois, atualize o trialEndDate:

```bash
node scripts/update-trial-date.js --email "admin-teste@example.com" --password "senha123" --days 2
```

## Onde o Banner Aparece

O banner aparece:
- ✅ No topo de todas as páginas do dashboard (logo abaixo do header)
- ✅ Apenas para usuários admin em trial
- ✅ Apenas quando faltam 3 dias ou menos

## Comportamento do Banner

- **3 dias restantes**: "Seu período de trial expira em 3 dias"
- **2 dias restantes**: "Seu período de trial expira em 2 dias"
- **1 dia restante**: "Seu período de trial expira amanhã!"
- **0 dias (hoje)**: "Seu período de trial expira hoje!"

O banner pode ser fechado clicando no botão X, mas reaparecerá na próxima vez que a página for carregada (até que o trial expire ou seja renovado).

## Testando Diferentes Cenários

### Ver o banner com diferentes mensagens:

```bash
# 3 dias
node scripts/update-trial-date.js --email "admin@example.com" --password "senha123" --days 3

# 2 dias
node scripts/update-trial-date.js --email "admin@example.com" --password "senha123" --days 2

# 1 dia (expira amanhã)
node scripts/update-trial-date.js --email "admin@example.com" --password "senha123" --days 1

# 0 dias (expira hoje)
node scripts/update-trial-date.js --email "admin@example.com" --password "senha123" --days 0
```

### Verificar que o banner NÃO aparece:

```bash
# Mais de 3 dias (banner não aparece)
node scripts/update-trial-date.js --email "admin@example.com" --password "senha123" --days 5
```

## Troubleshooting

**Banner não aparece?**
- ✅ Verifique se o usuário é admin (`role: "admin"`)
- ✅ Verifique se `trialEndDate` está configurado
- ✅ Verifique se faltam 3 dias ou menos
- ✅ Faça logout e login novamente para atualizar o estado
- ✅ Verifique o console do navegador para erros

**Banner aparece mas não fecha?**
- O banner pode ser fechado, mas reaparece ao recarregar a página (comportamento esperado)

