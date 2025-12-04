import { useCallback } from "react";
import {
  sendEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentReminderEmail,
  sendAppointmentApprovedEmail,
  sendAppointmentRejectedEmail,
  isEmailServiceEnabled,
  configureEmailService,
} from "../services/emailService";
import type { EmailData, EmailServiceConfig } from "../types/email";

/**
 * Hook para facilitar o uso do serviço de email
 */
export function useEmail() {
  const send = useCallback(async (emailData: EmailData) => {
    return await sendEmail(emailData);
  }, []);

  const sendAppointmentConfirmation = useCallback(
    async (
      clientEmail: string,
      clientName: string,
      appointmentDate: string,
      appointmentTime: string,
      nutritionistName?: string
    ) => {
      return await sendAppointmentConfirmationEmail(
        clientEmail,
        clientName,
        appointmentDate,
        appointmentTime,
        nutritionistName
      );
    },
    []
  );

  const sendAppointmentReminder = useCallback(
    async (
      clientEmail: string,
      clientName: string,
      appointmentDate: string,
      appointmentTime: string
    ) => {
      return await sendAppointmentReminderEmail(
        clientEmail,
        clientName,
        appointmentDate,
        appointmentTime
      );
    },
    []
  );

  const sendAppointmentApproved = useCallback(
    async (
      clientEmail: string,
      clientName: string,
      appointmentDate: string,
      appointmentTime: string
    ) => {
      return await sendAppointmentApprovedEmail(
        clientEmail,
        clientName,
        appointmentDate,
        appointmentTime
      );
    },
    []
  );

  const sendAppointmentRejected = useCallback(
    async (clientEmail: string, clientName: string, reason?: string) => {
      return await sendAppointmentRejectedEmail(clientEmail, clientName, reason);
    },
    []
  );

  return {
    send,
    sendAppointmentConfirmation,
    sendAppointmentReminder,
    sendAppointmentApproved,
    sendAppointmentRejected,
    isEnabled: isEmailServiceEnabled(),
    configure: configureEmailService,
  };
}

