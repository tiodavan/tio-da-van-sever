export interface SendMessageParams {
  to: string;
  message: string;
}

export interface INotificationProvider {
  send(params: SendMessageParams): Promise<void>;
}

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');
