import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  requestLimitPerDay: { type: Number, default: 10 },
  requestLimitPerWeek: { type: Number, default: 50 },
  whatsappEnabled: { type: Boolean, default: false },
  twilioAccountSid: { type: String },
  twilioAuthToken: { type: String },
  twilioPhoneNumber: { type: String },
}, { timestamps: true });

// Ensure only one settings document exists
settingsSchema.pre('save', async function(next) {
  const Settings = mongoose.model('Settings');
  if (this.isNew) {
    const count = await Settings.countDocuments();
    if (count > 0) {
      next(new Error('Only one settings document can exist'));
    }
  }
  next();
});

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);