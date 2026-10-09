import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    pricePerHour: { type: Number, required: true, min: 0 },
    tutoringMethod: {
      type: String,
      enum: ['Online', 'In-person', 'Online & In-person'],
      required: true,
    },
    location: { type: String, default: '' },
    availableDays: [{ type: String }],
    availableTimes: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    bookingRevision: { type: Number, default: 0, select: false },
  },
  { timestamps: true },
);
export default mongoose.models.TutorPost || mongoose.model('TutorPost', schema);
