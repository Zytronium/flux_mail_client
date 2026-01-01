export interface EmailAccount {
  id: string;
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
  label: string;
}

export interface EmailMessage {
  uid: number;
  subject: string;
  from: string;
  date: string;
  body?: string;
  htmlBody?: string;
  textBody?: string;
  folder?: string;
}

export interface ElectronAPI {
  login: (config: Omit<EmailAccount, 'id' | 'label'>) => Promise<{ success: boolean; error?: string }>;
  fetchEmails: (config: Omit<EmailAccount, 'id' | 'label'>, folder?: string) => Promise<{ success: boolean; messages?: EmailMessage[]; error?: string }>;
  sendEmail: (config: Omit<EmailAccount, 'id' | 'label'>, mail: { to: string; subject: string; text: string }) => Promise<{ success: boolean; error?: string }>;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  loadAccounts: () => Promise<EmailAccount[]>;
  saveAccounts: (accounts: EmailAccount[]) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
