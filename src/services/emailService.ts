import type {
  EmailData,
  EmailRecipient,
  EmailResult,
  EmailServiceConfig,
  EmailTemplate,
} from "../types/email";

// Configuração do serviço de email
// Por padrão, o serviço está desabilitado até que seja configurado
let emailConfig: EmailServiceConfig = {
  enabled: false,
  fromEmail: "noreply@nutrimanager.com",
  fromName: "NutriManager",
};

/**
 * Configura o serviço de email
 * @param config Configurações do serviço de email
 */
export function configureEmailService(config: EmailServiceConfig): void {
  emailConfig = { ...emailConfig, ...config };
}

/**
 * Verifica se o serviço de email está habilitado
 */
export function isEmailServiceEnabled(): boolean {
  return emailConfig.enabled === true;
}

/**
 * Gera o assunto do email baseado no template
 */
function getEmailSubject(template: EmailTemplate, _data: Record<string, any>): string {
  const subjects: Record<EmailTemplate, string> = {
    appointment_confirmation: "Confirmação de Agendamento - NutriManager",
    appointment_reminder: "Lembrete de Consulta - NutriManager",
    appointment_approved: "Consulta Aprovada - NutriManager",
    appointment_rejected: "Consulta Não Aprovada - NutriManager",
    diet_ready: "Sua Dieta Está Pronta - NutriManager",
    substitution_approved: "Substituição Aprovada - NutriManager",
    substitution_rejected: "Substituição Não Aprovada - NutriManager",
    trial_warning: "Aviso: Período de Trial Expirando - NutriManager",
    trial_expired: "Período de Trial Expirado - NutriManager",
    welcome: "Bem-vindo ao NutriManager!",
  };

  return subjects[template] || "Notificação - NutriManager";
}

/**
 * Gera o corpo do email em HTML baseado no template
 * @internal - Será usado quando o envio real de email for implementado
 */
// @ts-ignore - Função será usada quando o envio de email for implementado
function getEmailBody(template: EmailTemplate, data: Record<string, any>): string {
  const templates: Record<EmailTemplate, (data: Record<string, any>) => string> = {
    appointment_confirmation: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Consulta Agendada com Sucesso!</h1>
          </div>
          <div class="content">
            <p>Olá ${data.clientName || "Cliente"},</p>
            <p>Sua consulta foi agendada com sucesso!</p>
            <p><strong>Data:</strong> ${data.appointmentDate || "N/A"}</p>
            <p><strong>Horário:</strong> ${data.appointmentTime || "N/A"}</p>
            ${data.nutritionistName ? `<p><strong>Nutricionista:</strong> ${data.nutritionistName}</p>` : ""}
            <p>Por favor, confirme sua presença ou entre em contato caso precise reagendar.</p>
            <p>Atenciosamente,<br>Equipe NutriManager</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    appointment_reminder: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Lembrete de Consulta</h1>
          </div>
          <div class="content">
            <p>Olá ${data.clientName || "Cliente"},</p>
            <p>Este é um lembrete de que você tem uma consulta agendada:</p>
            <p><strong>Data:</strong> ${data.appointmentDate || "N/A"}</p>
            <p><strong>Horário:</strong> ${data.appointmentTime || "N/A"}</p>
            <p>Nos vemos em breve!</p>
            <p>Atenciosamente,<br>Equipe NutriManager</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    appointment_approved: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Consulta Aprovada!</h1>
          </div>
          <div class="content">
            <p>Olá ${data.clientName || "Cliente"},</p>
            <p>Sua solicitação de consulta foi aprovada!</p>
            <p><strong>Data:</strong> ${data.appointmentDate || "N/A"}</p>
            <p><strong>Horário:</strong> ${data.appointmentTime || "N/A"}</p>
            <p>Estamos ansiosos para atendê-lo(a)!</p>
            <p>Atenciosamente,<br>Equipe NutriManager</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    appointment_rejected: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Consulta Não Aprovada</h1>
          </div>
          <div class="content">
            <p>Olá ${data.clientName || "Cliente"},</p>
            <p>Infelizmente, sua solicitação de consulta não pôde ser aprovada no momento.</p>
            ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ""}
            <p>Por favor, entre em contato conosco para reagendar ou escolher outro horário.</p>
            <p>Atenciosamente,<br>Equipe NutriManager</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    diet_ready: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sua Dieta Está Pronta!</h1>
          </div>
          <div class="content">
            <p>Olá ${data.clientName || "Cliente"},</p>
            <p>Sua dieta personalizada está pronta e disponível para visualização!</p>
            <p><strong>Dieta:</strong> ${data.dietName || "Nova Dieta"}</p>
            <p>Acesse o aplicativo para visualizar todos os detalhes da sua dieta.</p>
            <p>Atenciosamente,<br>Equipe NutriManager</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    substitution_approved: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Substituição Aprovada</h1>
          </div>
          <div class="content">
            <p>Olá ${data.clientName || "Cliente"},</p>
            <p>Sua solicitação de substituição de alimento foi aprovada!</p>
            <p>Acesse o aplicativo para ver os detalhes.</p>
            <p>Atenciosamente,<br>Equipe NutriManager</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    substitution_rejected: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Substituição Não Aprovada</h1>
          </div>
          <div class="content">
            <p>Olá ${data.clientName || "Cliente"},</p>
            <p>Sua solicitação de substituição não pôde ser aprovada.</p>
            ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ""}
            <p>Por favor, entre em contato para mais informações.</p>
            <p>Atenciosamente,<br>Equipe NutriManager</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    trial_warning: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Aviso: Período de Trial Expirando</h1>
          </div>
          <div class="content">
            <p>Olá ${data.userName || "Usuário"},</p>
            <p>Seu período de trial está expirando em breve!</p>
            <p><strong>Dias restantes:</strong> ${data.daysRemaining || "N/A"}</p>
            <p>Para continuar usando o NutriManager, assine um de nossos planos.</p>
            <p>Atenciosamente,<br>Equipe NutriManager</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    trial_expired: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Período de Trial Expirado</h1>
          </div>
          <div class="content">
            <p>Olá ${data.userName || "Usuário"},</p>
            <p>Seu período de trial expirou. Para continuar usando o NutriManager, assine um de nossos planos.</p>
            <p>Atenciosamente,<br>Equipe NutriManager</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    welcome: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo ao NutriManager!</h1>
          </div>
          <div class="content">
            <p>Olá ${data.userName || "Usuário"},</p>
            <p>Bem-vindo ao NutriManager! Estamos felizes em tê-lo(a) conosco.</p>
            <p>Comece a usar todas as funcionalidades disponíveis em nossa plataforma.</p>
            <p>Atenciosamente,<br>Equipe NutriManager</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  const templateFunction = templates[template];
  if (!templateFunction) {
    throw new Error(`Template de email não encontrado: ${template}`);
  }

  return templateFunction(data);
}

/**
 * Normaliza os destinatários para um array
 */
function normalizeRecipients(to: EmailRecipient | EmailRecipient[]): EmailRecipient[] {
  return Array.isArray(to) ? to : [to];
}

/**
 * Envia um email usando o serviço configurado
 * 
 * NOTA: Esta é uma implementação básica que precisa ser integrada com:
 * - Firebase Cloud Functions (recomendado)
 * - Serviço de email externo (SendGrid, Resend, AWS SES, etc.)
 * 
 * Por enquanto, apenas registra no console quando o serviço está desabilitado
 */
export async function sendEmail(emailData: EmailData): Promise<EmailResult> {
  try {
    // Verificar se o serviço está habilitado
    if (!isEmailServiceEnabled()) {
      console.warn("Serviço de email desabilitado. Email não enviado:", {
        template: emailData.template,
        to: emailData.to,
        subject: emailData.subject || getEmailSubject(emailData.template, emailData.data),
      });
      return {
        success: false,
        error: "Serviço de email desabilitado. Configure o serviço antes de enviar emails.",
      };
    }

    // Normalizar destinatários
    const recipients = normalizeRecipients(emailData.to);

    // Gerar assunto e corpo do email
    const subject = emailData.subject || getEmailSubject(emailData.template, emailData.data);
    // TODO: htmlBody será usado quando o envio real for implementado
    // const htmlBody = getEmailBody(emailData.template, emailData.data);

    // TODO: Implementar envio real via:
    // 1. Firebase Cloud Functions (https://firebase.google.com/docs/functions)
    // 2. API externa (SendGrid, Resend, AWS SES, etc.)

    // Exemplo de integração com Firebase Cloud Functions:
    // const functions = getFunctions();
    // const sendEmailFunction = httpsCallable(functions, 'sendEmail');
    // const result = await sendEmailFunction({
    //   to: recipients.map(r => r.email),
    //   subject,
    //   html: htmlBody,
    //   from: emailConfig.fromEmail,
    //   fromName: emailConfig.fromName,
    // });

    // Por enquanto, apenas simula o envio
    console.log("📧 Email simulado:", {
      to: recipients.map((r) => r.email).join(", "),
      subject,
      template: emailData.template,
    });

    return {
      success: true,
      messageId: `simulated-${Date.now()}`,
    };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao enviar email",
    };
  }
}

/**
 * Envia email de confirmação de agendamento
 */
export async function sendAppointmentConfirmationEmail(
  clientEmail: string,
  clientName: string,
  appointmentDate: string,
  appointmentTime: string,
  nutritionistName?: string
): Promise<EmailResult> {
  return sendEmail({
    to: { email: clientEmail, name: clientName },
    template: "appointment_confirmation",
    data: {
      clientName,
      appointmentDate,
      appointmentTime,
      nutritionistName,
    },
  });
}

/**
 * Envia email de lembrete de consulta
 */
export async function sendAppointmentReminderEmail(
  clientEmail: string,
  clientName: string,
  appointmentDate: string,
  appointmentTime: string
): Promise<EmailResult> {
  return sendEmail({
    to: { email: clientEmail, name: clientName },
    template: "appointment_reminder",
    data: {
      clientName,
      appointmentDate,
      appointmentTime,
    },
  });
}

/**
 * Envia email de aprovação de consulta
 */
export async function sendAppointmentApprovedEmail(
  clientEmail: string,
  clientName: string,
  appointmentDate: string,
  appointmentTime: string
): Promise<EmailResult> {
  return sendEmail({
    to: { email: clientEmail, name: clientName },
    template: "appointment_approved",
    data: {
      clientName,
      appointmentDate,
      appointmentTime,
    },
  });
}

/**
 * Envia email de rejeição de consulta
 */
export async function sendAppointmentRejectedEmail(
  clientEmail: string,
  clientName: string,
  reason?: string
): Promise<EmailResult> {
  return sendEmail({
    to: { email: clientEmail, name: clientName },
    template: "appointment_rejected",
    data: {
      clientName,
      reason,
    },
  });
}

