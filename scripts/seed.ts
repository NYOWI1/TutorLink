import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import TutorPost from '../src/models/TutorPost';
import Booking from '../src/models/Booking';
export async function seed() {
  if ((await User.countDocuments()) > 0) return;
  const password = await bcrypt.hash('TutorLink2026!', 12);
  const people = await User.create([
    {
      name: 'Maya Chen',
      email: 'maya@tutorlink.demo',
      password,
      major: 'Computer Science',
      yearOfStudy: 3,
      university: 'Assumption University',
      bio: 'A curious mind, a coffee enthusiast, and a believer in learning together. I love helping people find their footing in web development.',
    },
    {
      name: 'James Lee',
      email: 'james@tutorlink.demo',
      password,
      major: 'Computer Science',
      yearOfStudy: 4,
      university: 'Assumption University',
      bio: 'Programming makes more sense when you build things. Let’s turn tricky concepts into small, practical wins.',
    },
    {
      name: 'Sofia Kim',
      email: 'sofia@tutorlink.demo',
      password,
      major: 'Business Administration',
      yearOfStudy: 3,
      university: 'Assumption University',
      bio: 'Here to make numbers a little less intimidating. Patient explanations, real examples, and plenty of practice.',
    },
    {
      name: 'Arun Patel',
      email: 'arun@tutorlink.demo',
      password,
      major: 'Applied Mathematics',
      yearOfStudy: 4,
      university: 'Assumption University',
      bio: 'Math is a language anyone can learn. I help students connect the dots, one problem at a time.',
    },
    {
      name: 'Nina Williams',
      email: 'nina@tutorlink.demo',
      password,
      major: 'Business English',
      yearOfStudy: 3,
      university: 'Assumption University',
      bio: 'Let’s build your confidence in English through relaxed conversations and useful everyday exercises.',
    },
    {
      name: 'Theo Park',
      email: 'theo@tutorlink.demo',
      password,
      major: 'Communication Design',
      yearOfStudy: 3,
      university: 'Assumption University',
      bio: 'I enjoy helping new designers find their voice. Learn the fundamentals and make something you’re proud of.',
    },
  ]);
  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const offers = [
    [
      'Java & OOP, made simple',
      'Programming',
      'From your first class to your first “aha!” moment. Let’s break down Java, object-oriented programming, and the concepts that finally make everything click.',
      250,
      1,
      'Online & In-person',
      'AU Library',
      ['Monday', 'Wednesday', 'Friday'],
    ],
    [
      'Calculus without the confusion',
      'Mathematics',
      'Limits, derivatives, integrals — we’ll make sense of them together. Step-by-step explanations and practice tailored to your course, at your own pace.',
      200,
      3,
      'In-person',
      'AU Learning Commons',
      ['Tuesday', 'Thursday', 'Saturday'],
    ],
    [
      'Accounting that adds up',
      'Business',
      'Get comfortable with financial statements, journal entries, and the accounting cycle. Practical examples for first- and second-year business students.',
      200,
      2,
      'Online & In-person',
      'AU Library',
      ['Monday', 'Tuesday', 'Friday'],
    ],
    [
      'Find your voice in English',
      'Languages',
      'Build your confidence in presentations, conversation, and academic writing. A relaxed space to practice, ask questions, and get useful feedback.',
      180,
      4,
      'Online',
      'Google Meet',
      ['Wednesday', 'Friday', 'Sunday'],
    ],
    [
      'Your first steps in UI design',
      'Design',
      'Learn visual hierarchy, layout, and the basics of Figma. We’ll work through a small interface together and build a foundation you can use on any project.',
      300,
      5,
      'Online & In-person',
      'Design Studio',
      ['Tuesday', 'Thursday', 'Saturday'],
    ],
    [
      'Web development, one step at a time',
      'Programming',
      'Build something real with HTML, CSS, and JavaScript. I’ll help you understand the fundamentals, debug your code, and feel at home on the web.',
      250,
      0,
      'Online & In-person',
      'AU Library',
      allDays,
    ],
    [
      'Statistics for curious minds',
      'Mathematics',
      'Probability, hypothesis testing, and data analysis explained with examples from everyday life. Bring your questions and we’ll untangle them together.',
      220,
      3,
      'Online',
      'Google Meet',
      ['Monday', 'Wednesday', 'Friday'],
    ],
    [
      'Make sense of microeconomics',
      'Business',
      'Supply, demand, markets, and more. Understand the ideas behind the graphs with friendly explanations and worked examples for your next exam.',
      200,
      2,
      'In-person',
      'AU Learning Commons',
      ['Tuesday', 'Thursday', 'Sunday'],
    ],
  ];
  const posts = [];
  for (const [
    title,
    subject,
    description,
    pricePerHour,
    person,
    tutoringMethod,
    location,
    availableDays,
  ] of offers)
    posts.push(
      await TutorPost.create({
        title,
        subject,
        description,
        pricePerHour,
        userId: people[person as number]._id,
        tutoringMethod,
        location,
        availableDays,
        availableTimes: { start: '09:00', end: '20:00' },
      }),
    );
  function date(days: number) {
    return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  }
  await Booking.create([
    {
      tutorPostId: posts[0]._id,
      studentUserId: people[0]._id,
      tutorUserId: people[1]._id,
      sessionDate: date(7),
      startTime: '16:00',
      duration: 1.5,
      message: 'I’d love some help understanding inheritance and interfaces.',
      pricePerHour: 250,
      status: 'Accepted',
    },
    {
      tutorPostId: posts[5]._id,
      studentUserId: people[2]._id,
      tutorUserId: people[0]._id,
      sessionDate: date(8),
      startTime: '14:00',
      duration: 1,
      message: 'Could we work on CSS layouts and responsive design?',
      pricePerHour: 250,
      status: 'Pending',
    },
    {
      tutorPostId: posts[5]._id,
      studentUserId: people[4]._id,
      tutorUserId: people[0]._id,
      sessionDate: date(9),
      startTime: '10:00',
      duration: 2,
      message: 'I’m building my first portfolio. I could use some help getting started.',
      pricePerHour: 250,
      status: 'Pending',
    },
  ]);
  console.log('Sample data ready. Demo sign-in: maya@tutorlink.demo / TutorLink2026!');
}
if (process.argv[1]?.endsWith('seed.ts')) {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI before seeding');
  await mongoose.connect(process.env.MONGODB_URI);
  await seed();
  await mongoose.disconnect();
}
