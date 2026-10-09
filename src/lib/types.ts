export type User = {
  _id: string;
  name: string;
  email?: string;
  profileImage: string;
  bio: string;
  university: string;
  major: string;
  yearOfStudy: number;
};
export type Post = {
  _id: string;
  userId: User;
  title: string;
  subject: string;
  description: string;
  pricePerHour: number;
  tutoringMethod: string;
  location: string;
  availableDays: string[];
  availableTimes: { start: string; end: string };
  status: string;
};
export type Booking = {
  _id: string;
  tutorPostId: Post;
  studentUserId: User;
  tutorUserId: User;
  sessionDate: string;
  startTime: string;
  duration: number;
  message: string;
  pricePerHour: number;
  status: string;
};
