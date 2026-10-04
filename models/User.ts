import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    profileImage: { type: String, default: '' },
    bio: { type: String, default: '' },
    university: { type: String, default: '' },
    major: { type: String, default: '' },
    yearOfStudy: { type: Number, default: 1 },
    bookingRevision: { type: Number, default: 0, select: false },
  },
  { timestamps: true },
);
export default mongoose.models.User || mongoose.model('User', schema);
