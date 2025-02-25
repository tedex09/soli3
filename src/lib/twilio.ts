import twilio from 'twilio';
import Settings from '@/models/Settings';

let twilioClient: twilio.Twilio | null = null;

export async function initTwilioClient() {
  const settings = await Settings.findOne();
  if (!settings?.whatsappEnabled) return null;

  twilioClient = twilio(settings.twilioAccountSid, settings.twilioAuthToken);
  return twilioClient;
}

export async function sendWhatsAppNotification(to: string, message: string) {
  try {
    const settings = await Settings.findOne();
    if (!settings?.whatsappEnabled) return;

    const client = await initTwilioClient();
    if (!client) return;

    await client.messages.create({
      body: message,
      from: `whatsapp:${settings.twilioPhoneNumber}`,
      to: `whatsapp:${to}`
    });
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
  }
}