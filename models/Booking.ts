import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    tutorPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TutorPost',
      required: true,
      index: true,
    },
    studentUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tutorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionDate: { type: String, required: true },
    startTime: { type: String, required: true },
    duration: { type: Number, required: true, min: 0.5 },
    message: { type: String, default: '' },
    pricePerHour: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true },
);
schema.index({ tutorUserId: 1, sessionDate: 1, status: 1 });
export default mongoose.models.Booking || mongoose.model('Booking', schema);
