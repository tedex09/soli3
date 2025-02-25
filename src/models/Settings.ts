import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  requestLimitPerDay: { type: Number, default: 10 },
  requestLimitPerWeek: { type: Number, default: 50 },
  whatsappEnabled: { type: Boolean, default: true },
  twilioAccountSid: { type: String, required: true },
  twilioAuthToken: { type: String, required: true },
  twilioPhoneNumber: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);