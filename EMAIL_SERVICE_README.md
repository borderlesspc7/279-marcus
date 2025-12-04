# Serviço de Notificações por Email

Este documento descreve como usar o sistema de notificações por email do NutriManager.

## 📋 Visão Geral

O sistema de email foi criado para enviar notificações automáticas aos usuários em diferentes situações:

- ✅ Confirmação de agendamento
- ✅ Lembretes de consulta
- ✅ Aprovação/rejeição de solicitações
- ✅ Dieta pronta
- ✅ Substituições aprovadas/rejeitadas
- ✅ Avisos de trial
- ✅ Emails de boas-vindas

## 🚀 Início Rápido

### 1. Configuração Básica

Por padrão, o serviço está **desabilitado**. Para habilitar:

```typescript
import { configureEmailService } from "./services/emailService";

// Habilitar o serviço (ainda precisa implementar o envio real)
configureEmailService({
  enabled: true,
  fromEmail: "noreply@nutrimanager.com",
  fromName: "NutriManager",
});
```

### 2. Usando o Hook

```typescript
import { useEmail } from "./hooks/useEmail";

function MeuComponente() {
  const { sendAppointmentConfirmation, isEnabled } = useEmail();

  const handleSendEmail = async () => {
    if (!isEnabled) {
      console.warn("Serviço de email desabilitado");
      return;
    }

    const result = await sendAppointmentConfirmation(
      "cliente@example.com",
      "João Silva",
      "15/03/2025",
      "14:00",
      "Dr. Maria Santos"
    );

    if (result.success) {
      console.log("Email enviado!");
    } else {
      console.error("Erro:", result.error);
    }
  };

  return <button onClick={handleSendEmail}>Enviar Email</button>;
}
```

## 📧 Templates Disponíveis

### 1. Confirmação de Agendamento

```typescript
import { sendAppointmentConfirmationEmail } from "./services/emailService";

await sendAppointmentConfirmationEmail(
  "cliente@example.com",
  "João Silva",
  "15/03/2025",
  "14:00",
  "Dr. Maria Santos" // opcional
);
```

### 2. Lembrete de Consulta

```typescript
import { sendAppointmentReminderEmail } from "./services/emailService";

await sendAppointmentReminderEmail(
  "cliente@example.com",
  "João Silva",
  "15/03/2025",
  "14:00"
);
```

### 3. Aprovação de Consulta

```typescript
import { sendAppointmentApprovedEmail } from "./services/emailService";

await sendAppointmentApprovedEmail(
  "cliente@example.com",
  "João Silva",
  "15/03/2025",
  "14:00"
);
```

### 4. Rejeição de Consulta

```typescript
import { sendAppointmentRejectedEmail } from "./services/emailService";

await sendAppointmentRejectedEmail(
  "cliente@example.com",
  "João Silva",
  "Horário não disponível" // motivo opcional
);
```

### 5. Email Customizado

```typescript
import { sendEmail } from "./services/emailService";

await sendEmail({
  to: { email: "cliente@example.com", name: "João Silva" },
  template: "welcome",
  data: {
    userName: "João Silva",
  },
});
```

## 🔧 Implementação do Envio Real

Atualmente, o serviço apenas **simula** o envio de emails. Para implementar o envio real, você tem duas opções:

### Opção 1: Firebase Cloud Functions (Recomendado)

1. **Criar a Cloud Function:**

```typescript
// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

// Configurar transporte de email (exemplo com Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
});

export const sendEmail = functions.https.onCall(async (data, context) => {
  const { to, subject, html, from, fromName } = data;

  const mailOptions = {
    from: `${fromName} <${from}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error: error.message };
  }
});
```

2. **Atualizar emailService.ts:**

```typescript
import { getFunctions, httpsCallable } from "firebase/functions";

export async function sendEmail(emailData: EmailData): Promise<EmailResult> {
  // ... código existente ...

  if (!isEmailServiceEnabled()) {
    // ... retorno de erro ...
  }

  // Chamar Cloud Function
  const functions = getFunctions();
  const sendEmailFunction = httpsCallable(functions, "sendEmail");
  
  const result = await sendEmailFunction({
    to: recipients.map((r) => r.email),
    subject,
    html: htmlBody,
    from: emailConfig.fromEmail,
    fromName: emailConfig.fromName,
  });

  return result.data as EmailResult;
}
```

### Opção 2: API Externa (SendGrid, Resend, AWS SES)

1. **Instalar SDK:**

```bash
npm install @sendgrid/mail
# ou
npm install resend
```

2. **Atualizar emailService.ts:**

```typescript
import sgMail from "@sendgrid/mail";

// Configurar API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function sendEmail(emailData: EmailData): Promise<EmailResult> {
  // ... código existente ...

  try {
    const recipients = normalizeRecipients(emailData.to);
    
    const msg = {
      to: recipients.map((r) => r.email),
      from: {
        email: emailConfig.fromEmail!,
        name: emailConfig.fromName!,
      },
      subject,
      html: htmlBody,
    };

    await sgMail.send(msg);

    return {
      success: true,
      messageId: `sg-${Date.now()}`,
    };
  } catch (error) {
    // ... tratamento de erro ...
  }
}
```

## 🔗 Integração com Sistema de Notificações

O serviço de email pode ser integrado com o sistema de notificações existente:

```typescript
import { useNotifications } from "./hooks/useNotifications";
import { useEmail } from "./hooks/useEmail";

function AppointmentForm() {
  const { success, error } = useNotifications();
  const { sendAppointmentConfirmation } = useEmail();

  const handleCreateAppointment = async (data) => {
    try {
      // Criar agendamento
      const appointmentId = await createAppointment(data);

      // Notificação no sistema
      success("Consulta agendada!", "Sua consulta foi agendada com sucesso.");

      // Enviar email
      const emailResult = await sendAppointmentConfirmation(
        data.clientEmail,
        data.clientName,
        formatDate(data.date),
        data.startTime,
        data.nutritionistName
      );

      if (!emailResult.success) {
        error(
          "Erro ao enviar email",
          "O agendamento foi criado, mas houve um problema ao enviar o email de confirmação."
        );
      }
    } catch (err) {
      error("Erro ao criar agendamento", err.message);
    }
  };

  return <div>...</div>;
}
```

## 📝 Estrutura de Arquivos

```
src/
├── services/
│   ├── emailService.ts          # Serviço principal de email
│   └── emailService.example.ts  # Exemplos de uso
├── types/
│   └── email.ts                 # Tipos TypeScript
└── hooks/
    └── useEmail.ts              # Hook React para facilitar uso
```

## 🎨 Personalização de Templates

Os templates HTML estão definidos em `emailService.ts`. Você pode personalizar:

- Cores e estilos
- Layout
- Conteúdo
- Adicionar novos templates

## ⚠️ Notas Importantes

1. **Serviço Desabilitado por Padrão**: O serviço precisa ser habilitado antes de usar
2. **Simulação Atual**: Por enquanto, apenas simula o envio (registra no console)
3. **Implementação Necessária**: Você precisa implementar o envio real usando uma das opções acima
4. **Segurança**: Nunca exponha chaves de API no código frontend. Use Cloud Functions ou variáveis de ambiente

## 📚 Próximos Passos

1. Escolher provedor de email (SendGrid, Resend, AWS SES, etc.)
2. Implementar envio real via Cloud Functions ou API direta
3. Configurar variáveis de ambiente
4. Testar envio de emails
5. Integrar com os fluxos existentes (agendamentos, dietas, etc.)

## 🤝 Suporte

Para dúvidas ou problemas, consulte:
- `src/services/emailService.example.ts` - Exemplos de uso
- `src/hooks/useEmail.ts` - Hook React
- `src/types/email.ts` - Tipos TypeScript

