export type EmailTemplate =
  | "appointment_confirmation"
  | "appointment_reminder"
  | "appointment_approved"
  | "appointment_rejected"
  | "diet_ready"
  | "substitution_approved"
  | "substitution_rejected"
  | "trial_warning"
  | "trial_expired"
  | "welcome";

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailData {
  to: EmailRecipient | EmailRecipient[];
  template: EmailTemplate;
  subject?: string;
  data: Record<string, unknown>;
}

export interface EmailServiceConfig {
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
  enabled?: boolean;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

