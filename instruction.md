# TutorLink – Peer Tutoring Social Marketplace

## 1. Project Overview

TutorLink is a peer-to-peer tutoring marketplace designed for university students.

The platform works similarly to a social marketplace, but it focuses only on tutoring.

There is only one type of user.

Every user can:

- Create a tutoring post to offer tutoring.
- Browse tutoring posts created by other users.
- Book a tutoring session.
- Manage their own tutoring posts.
- Manage bookings they created.
- Accept or reject booking requests made on their tutoring posts.
- Manage their personal profile.

A user can therefore act as both a tutor and a student.

---

# 2. Project Purpose

This project is developed as a Proof of Concept (POC) that may later be expanded into a senior project.

The main goal is to create a working tutoring marketplace using:

- Next.js
- MongoDB
- REST API
- CRUD operations
- GitHub
- Virtual Machine deployment

The system must follow all requirements given by the lecturer.

---

# 3. Lecturer Requirements

The project must follow these requirements.

## Technology

Required:

- Next.js
- MongoDB
- REST API
- GitHub
- Deployment on a Virtual Machine

Not allowed:

- Firebase
- Managed backend services
- Serverless deployment
- Vercel
- Azure Web App
- Cloning an existing project
- Forking an existing repository and modifying it

The project must be originally developed by the team.

---

# 4. Team Requirements

Maximum team size:

- 3 students

Working alone does not reduce the project scope.

All members must contribute to the project.

Contribution will be checked using Git commit history.

Each member should regularly:

- Create commits.
- Work on assigned features.
- Push their own work.
- Participate in debugging and testing.

Do not allow only one member to create most of the commits.

---

# 5. Main System Concept

TutorLink works as a tutoring social marketplace.

Example:

User A creates a tutoring post:

> Java Programming Tutoring  
> 250 THB/hour  
> Available Monday and Wednesday  
> Online or Assumption University

User B discovers the post and books a session.

User A receives the booking request and can:

- Accept
- Reject

After the tutoring session, the booking can be marked as:

- Completed

---

# 6. Main Data Models

The project must contain at least THREE CRUD data models.

TutorLink will use:

1. User
2. TutorPost
3. Booking

All three models must support CRUD operations.

---

# 7. Data Model 1 – User

The User model represents every registered user of TutorLink.

There are no separate Student and Tutor accounts.

A user can be both.

## Suggested Fields

```js
User {
  _id,
  name,
  email,
  password,
  profileImage,
  bio,
  university,
  major,
  yearOfStudy,
  createdAt,
  updatedAt
}
```

## User CRUD

### Create

Create a user account.

### Read

View:

- Own profile
- Other users' public profiles

### Update

User can edit:

- Name
- Profile image
- Bio
- University
- Major
- Year of study

### Delete

User can delete their account.

---

# 8. Data Model 2 – TutorPost

TutorPost represents a tutoring service offered by a user.

## Suggested Fields

```js
TutorPost {
  _id,
  userId,
  title,
  subject,
  description,
  pricePerHour,
  tutoringMethod,
  location,
  availableDays,
  availableTimes,
  status,
  createdAt,
  updatedAt
}
```

## Example

```text
Title:
Java Programming Tutoring

Subject:
Programming

Description:
I can help beginners understand Java,
OOP and basic programming concepts.

Price:
250 THB/hour

Tutoring Method:
Online / In-person

Location:
Assumption University

Availability:
Monday 4 PM – 7 PM
Wednesday 3 PM – 6 PM

Status:
Active
```

## TutorPost CRUD

### Create

User creates a tutoring post.

### Read

Users can:

- View tutoring posts.
- View post details.
- Search tutoring posts.
- Filter tutoring posts.

### Update

Only the post owner should be able to edit their post.

### Delete

Only the post owner should be able to delete their post.

---

# 9. Data Model 3 – Booking

Booking represents a tutoring session request.

## Suggested Fields

```js
Booking {
  _id,
  tutorPostId,
  studentUserId,
  tutorUserId,
  sessionDate,
  startTime,
  duration,
  message,
  status,
  createdAt,
  updatedAt
}
```

## Booking Status

Possible status values:

```text
Pending
Accepted
Rejected
Cancelled
Completed
```

## Booking CRUD

### Create

A user books another user's tutoring post.

### Read

Users can view:

- Bookings they created.
- Booking requests received on their tutoring posts.
- Booking details.

### Update

Users may update:

- Date
- Time
- Duration
- Message

Tutor/post owner may update:

- Pending → Accepted
- Pending → Rejected
- Accepted → Completed

Student may update:

- Pending → Cancelled
- Accepted → Cancelled

### Delete

A booking may be deleted when appropriate.

For example:

- Cancelled booking
- Old booking
- Test booking

---

# 10. Data Relationships

The main relationship is:

```text
User
 ├── creates ──> TutorPost
 │
 └── creates ──> Booking
                     │
                     └── references ──> TutorPost
```

Another way to understand it:

```text
USER A
  |
  | creates
  v
TUTOR POST
  ^
  |
  | books
  |
USER B
```

Both User A and User B use the same User model.

---

# 11. Main User Flow

## Flow 1 – Create Account

```text
Register
   ↓
Create User
   ↓
Login
   ↓
Home Feed
```

---

## Flow 2 – Create Tutoring Post

```text
Login
   ↓
Create Post
   ↓
Enter tutoring information
   ↓
Submit
   ↓
Post appears in marketplace
```

---

## Flow 3 – Find Tutor

```text
Home / Explore
   ↓
Search Subject
   ↓
View Tutor Post
   ↓
View Tutor Profile
```

---

## Flow 4 – Book Tutoring

```text
View Tutor Post
   ↓
Book Session
   ↓
Select Date
   ↓
Select Time
   ↓
Select Duration
   ↓
Add Message
   ↓
Submit Booking
```

Booking status starts as:

```text
Pending
```

---

## Flow 5 – Tutor Responds

```text
Tutor receives booking request
        ↓
     Pending
      /   \
 Accept   Reject
   ↓        ↓
Accepted  Rejected
```

After tutoring:

```text
Accepted
   ↓
Completed
```

---

# 12. Required Pages

Suggested application pages:

```text
/
├── Login
├── Register
│
├── Home
├── Explore
│
├── Posts
│   ├── Create Post
│   ├── Post Details
│   ├── Edit Post
│   └── My Posts
│
├── Bookings
│   ├── My Bookings
│   ├── Booking Requests
│   └── Booking Details
│
└── Profile
    ├── My Profile
    └── Edit Profile
```

---

# 13. Suggested Navigation

Main navigation:

```text
TutorLink

Home
Explore
Create Post
My Posts
My Bookings
Requests
Profile
```

---

# 14. Home Feed

The home page should show tutoring posts.

Example:

```text
---------------------------------

John Smith
Computer Science

Java Programming Tutoring

Beginner Java and OOP tutoring.

250 THB/hour

Online / AU

Monday, Wednesday

[ View Details ]

---------------------------------

May Lin
Business Administration

Financial Accounting Tutoring

200 THB/hour

AU Library

Tuesday, Friday

[ View Details ]

---------------------------------
```

Users should be able to browse posts similar to a social-media feed.

---

# 15. Explore Page

Users should be able to search tutoring posts.

Possible filters:

- Subject
- Price
- Tutoring method
- Location
- Availability

Example:

```text
Search:
[ Java Programming      ]

Subject:
[ Programming ▼ ]

Method:
[ Online ▼ ]

Max Price:
[ 300 THB ]

[ Search ]
```

---

# 16. Post Details Page

A tutoring post should display:

- Tutor profile
- Post title
- Subject
- Description
- Price
- Tutoring method
- Location
- Availability
- Post status

Actions:

```text
View Profile

Book Session
```

If viewing your own post:

```text
Edit Post

Delete Post
```

The owner should NOT be able to book their own tutoring post.

---

# 17. User Profile Page

Example:

```text
John Smith

Computer Science
Year 3
Assumption University

About

I enjoy programming and helping
students understand coding.

Tutoring Posts

Java Programming
Web Development
```

Public profiles may show:

- Name
- Bio
- University
- Major
- Tutoring posts

Private information such as passwords must never be displayed.

---

# 18. My Posts Page

Users should be able to manage tutoring posts they created.

Example:

```text
My Tutor Posts

Java Programming
250 THB/hour
Active

[ View ]
[ Edit ]
[ Delete ]
```

---

# 19. My Bookings Page

This page represents sessions where the logged-in user is the student.

Example:

```text
My Bookings

Java Programming
Tutor: John

10 September 2026
5:00 PM
2 Hours

Status: Accepted

[ View ]
[ Cancel ]
```

---

# 20. Booking Requests Page

This page represents bookings made on the logged-in user's tutoring posts.

Example:

```text
Booking Requests

Student:
May

Post:
Java Programming

September 10
5:00 PM

Message:
I need help understanding Java OOP.

Status:
Pending

[ Accept ]
[ Reject ]
```

---

# 21. REST API Requirements

The system must use REST APIs.

Minimum APIs should include:

## User API

```text
GET    /api/users
POST   /api/users

GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

---

## TutorPost API

```text
GET    /api/posts
POST   /api/posts

GET    /api/posts/:id
PUT    /api/posts/:id
DELETE /api/posts/:id
```

---

## Booking API

```text
GET    /api/bookings
POST   /api/bookings

GET    /api/bookings/:id
PUT    /api/bookings/:id
DELETE /api/bookings/:id
```

---

# 22. Example REST API Response

Example:

```json
{
  "_id": "123",
  "title": "Java Programming Tutoring",
  "subject": "Programming",
  "pricePerHour": 250,
  "tutoringMethod": "Online",
  "status": "Active"
}
```

---

# 23. REST API Rules

Use proper HTTP methods.

```text
GET
Read data

POST
Create data

PUT or PATCH
Update data

DELETE
Delete data
```

Use correct HTTP status codes where possible.

Example:

```text
200 OK

201 Created

400 Bad Request

401 Unauthorized

404 Not Found

500 Internal Server Error
```

---

# 24. Authentication

Authentication is recommended because users need ownership over posts and bookings.

Suggested authentication:

- Email
- Password
- Password hashing
- Session or JWT authentication

Do NOT store plain-text passwords.

Passwords should be hashed before being stored in MongoDB.

---

# 25. Authorization Rules

Users must only be able to modify their own data.

Example:

A user can:

```text
Edit own profile
Delete own account

Edit own TutorPost
Delete own TutorPost

Cancel own Booking
```

A user should NOT be able to:

```text
Edit another user's profile

Edit another user's TutorPost

Delete another user's TutorPost

Modify unrelated bookings
```

---

# 26. Important Booking Rules

Prevent invalid bookings.

Examples:

A user should not be able to:

- Book their own tutoring post.
- Book an inactive tutoring post.
- Enter a past date.
- Enter zero or negative duration.

Required validation should be included.

---

# 27. Form Validation

Forms should validate important information.

## User

Required:

- Name
- Email
- Password

Validate email format.

---

## TutorPost

Required:

- Title
- Subject
- Description
- Price
- Availability

Price must be:

```text
>= 0
```

---

## Booking

Required:

- TutorPost
- Date
- Time
- Duration

Date should not be in the past.

Duration should be greater than zero.

---

# 28. Suggested Project Structure

Recommended Next.js structure:

```text
tutorlink/
│
├── app/
│   ├── api/
│   │   ├── users/
│   │   ├── posts/
│   │   └── bookings/
│   │
│   ├── login/
│   ├── register/
│   ├── explore/
│   ├── posts/
│   ├── bookings/
│   ├── profile/
│   └── page.jsx
│
├── components/
│   ├── Navbar.jsx
│   ├── TutorPostCard.jsx
│   ├── BookingCard.jsx
│   ├── SearchBar.jsx
│   └── ProfileCard.jsx
│
├── models/
│   ├── User.js
│   ├── TutorPost.js
│   └── Booking.js
│
├── lib/
│   ├── mongodb.js
│   └── auth.js
│
├── public/
│
├── .env.local
├── .gitignore
├── package.json
├── README.md
└── instruction.md
```

The exact structure may change during development, but the three main models must remain.

---

# 29. MongoDB

MongoDB must be used as the database.

Recommended collections:

```text
users

tutorposts

bookings
```

Relationships should normally be stored using MongoDB ObjectIds.

Example:

```js
userId: ObjectId

tutorPostId: ObjectId

studentUserId: ObjectId

tutorUserId: ObjectId
```

---

# 30. Environment Variables

Sensitive information must not be committed to GitHub.

Example:

```env
MONGODB_URI=

JWT_SECRET=

NEXT_PUBLIC_BASE_URL=
```

`.env.local` must be inside `.gitignore`.

Never commit:

- Database passwords
- JWT secrets
- API secrets

---

# 31. UI Requirements

The lecturer gives:

- 5 marks for complete UI.

Therefore all necessary CRUD operations should have a working interface.

Do not create API-only functionality.

The UI should allow users to perform all important actions.

Example:

```text
Create Post

View Post

Edit Post

Delete Post
```

must all be accessible through the UI.

The same principle applies to:

- User
- TutorPost
- Booking

---

# 32. Responsive Design

The application should work on:

- Desktop
- Tablet
- Mobile

Recommended approach:

- Tailwind CSS

Keep the interface simple and consistent.

---

# 33. Error Handling

The application should show understandable error messages.

Example:

```text
Unable to create tutoring post.

Please complete all required fields.
```

Avoid showing technical server errors directly to users.

---

# 34. Loading States

Show loading indicators when retrieving information.

Example:

```text
Loading tutoring posts...
```

Do not leave a blank page while data is loading.

---

# 35. Empty States

Example:

```text
No tutoring posts found.

Try searching for another subject.
```

For personal posts:

```text
You haven't created any tutoring posts yet.

[ Create Your First Post ]
```

---

# 36. Git Requirements

The project must be stored on GitHub.

Recommended development workflow:

```text
main
development
feature/*
```

Example branches:

```text
feature/user-profile

feature/tutor-post

feature/booking

feature/authentication
```

Each member should regularly commit their work.

Example commits:

```text
feat: add TutorPost model

feat: create tutoring post API

feat: add booking form

fix: validate booking date

style: improve mobile navigation
```

Avoid commits such as:

```text
update

changes

fix

work
```

Use meaningful commit messages.

---

# 37. README.md Requirements

The lecturer requires the README to contain:

- Project name
- Team members
- Links to team member repositories/profiles
- Project description
- Screenshots

Recommended README structure:

```text
# TutorLink

## Project Description

## Team Members

## Main Features

## Technology Stack

## Data Models

## REST API

## Screenshots

## Installation

## Environment Variables

## Running Locally

## Deployment

## Production URL
```

---

# 38. Team Members Section

Example:

```markdown
## Team Members

- Member Name – [GitHub](GitHub profile link)
- Member Name – [GitHub](GitHub profile link)
- Member Name – [GitHub](GitHub profile link)
```

Student IDs are not required in README.

---

# 39. Screenshots

README should include screenshots of the completed system.

Recommended screenshots:

1. Home page
2. Explore page
3. Tutor post details
4. Create tutoring post
5. User profile
6. My posts
7. My bookings
8. Booking requests

---

# 40. Deployment Requirements

The completed application must be deployed to a Virtual Machine.

Allowed example architecture:

```text
Internet
    |
    v
Nginx
    |
    v
Next.js Application
    |
    v
REST API
    |
    v
MongoDB
```

Possible setup:

```text
Ubuntu VM

Node.js

Next.js

PM2

Nginx
```

---

# 41. Not Allowed for Deployment

Do NOT use:

```text
Vercel

Azure Web App

Firebase Hosting with managed backend

Other serverless application hosting
```

The application itself must run on a VM.

---

# 42. Production Requirements

The lecturer must be able to open the submitted URL.

Before submission check:

```text
Production URL works

Home page loads

Login works

Register works

Tutor posts load

Create post works

Edit works

Delete works

Booking works

Accept/reject booking works
```

Do not submit a localhost URL.

---

# 43. Proposal Requirements

The proposal is worth:

```text
10 marks
```

Important lecturer rule:

Without the proposal:

```text
TOTAL PROJECT SCORE = ZERO
```

If the proposal is late:

```text
Proposal score = 0
```

Other project sections may still be assessed.

If the final project does not match the proposal:

```text
Proposal score = 0
```

Therefore the project scope in the proposal must match TutorLink.

---

# 44. Proposal Topic

Recommended proposal title:

```text
TutorLink – Peer Tutoring Social Marketplace
```

---

# 45. Proposal Description

TutorLink is a peer-to-peer tutoring marketplace designed for university students. Unlike a traditional tutoring platform with separate tutor and student roles, every user can both offer and request tutoring services.

Users can create tutoring posts containing information such as subject, price, tutoring method, location, and availability. Other users can browse tutoring posts and request tutoring sessions. Users who created tutoring posts can accept or reject booking requests.

The application will be developed using Next.js and MongoDB and will provide REST API CRUD operations for three main data models: User, TutorPost, and Booking.

---

# 46. Proposal Main Features

Include these features in the proposal:

- User registration
- User profile management
- Create tutoring post
- Browse tutoring posts
- Search tutoring posts
- View tutoring post details
- Edit tutoring post
- Delete tutoring post
- Create tutoring booking
- View bookings
- Cancel booking
- Accept booking
- Reject booking
- Complete booking

Do not promise unnecessary features that may not be completed.

---

# 47. Scope Control

The final project must match the proposal.

Therefore avoid adding major promised features such as:

- Online payments
- Real-time chat
- Video calling
- AI recommendations

unless the team is confident they can complete them.

These can be listed as future improvements instead.

---

# 48. Out of Scope for Current POC

The following features are NOT required for the current version:

- Online payment
- Payment gateway
- Real-time chat
- Video calls
- AI matching
- AI chatbot
- Mobile application
- University SSO
- Advanced recommendation system
- Automated notifications
- Rating and review system

These may become senior-project extensions later.

---

# 49. Future Senior Project Improvements

TutorLink can later be expanded with:

- Tutor ratings
- Reviews
- Favorite tutors
- Real-time messaging
- Push notifications
- Online payment
- Video tutoring
- AI tutor matching
- Calendar integration
- Tutor verification
- University verification
- Recommendation system
- Reporting and moderation
- Tutor analytics

---

# 50. Suggested Team Responsibilities

For a team of three:

## Member 1 – User & Authentication

Responsible for:

- User model
- Registration
- Login
- Profile
- Authentication
- Authorization
- User CRUD

---

## Member 2 – TutorPost

Responsible for:

- TutorPost model
- TutorPost REST API
- Create post
- Post feed
- Post details
- Search
- Edit post
- Delete post

---

## Member 3 – Booking & Deployment

Responsible for:

- Booking model
- Booking API
- Create booking
- My bookings
- Booking requests
- Accept/reject
- Booking status
- VM deployment
- Nginx
- PM2

---

# 51. Team Integration

All team members should also contribute to:

- Testing
- Debugging
- UI improvements
- README
- Deployment testing
- Video demonstration

Contribution should not be completely separated.

Git history should show meaningful participation from everyone.

---

# 52. Suggested Development Milestones

## Phase 1 – Proposal

Complete:

- Project name
- Project concept
- Team members
- Main data models
- Main features
- Technology stack

---

## Phase 2 – Project Setup

Complete:

- Next.js project
- GitHub repository
- MongoDB connection
- Folder structure
- Environment variables

---

## Phase 3 – User CRUD

Complete:

- User model
- Register
- User API
- Profile
- Edit profile
- Delete account

---

## Phase 4 – TutorPost CRUD

Complete:

- TutorPost model
- Create post
- Read posts
- Edit post
- Delete post
- Explore page

---

## Phase 5 – Booking CRUD

Complete:

- Booking model
- Create booking
- View booking
- Update booking
- Cancel/delete booking
- Accept/reject booking

---

## Phase 6 – UI Completion

Complete:

- Navigation
- Responsive design
- Forms
- Loading states
- Error messages
- Empty states

---

## Phase 7 – Testing

Test:

- User CRUD
- TutorPost CRUD
- Booking CRUD
- Authentication
- Authorization
- Relationships
- Invalid data
- Mobile layout

---

## Phase 8 – Deployment

Complete:

- VM
- Node.js
- MongoDB connectivity
- PM2
- Nginx
- Production environment variables

---

## Phase 9 – Documentation

Complete:

- README
- Screenshots
- Team links
- Production URL
- Setup instructions

---

## Phase 10 – Video

Record a maximum approximately 5-minute system demonstration.

---

# 53. 5-Minute Video Suggested Flow

## 0:00 – 0:30

Introduce:

```text
TutorLink – Peer Tutoring Social Marketplace
```

Explain the purpose.

---

## 0:30 – 1:00

Show:

- Register
- Login
- User profile

---

## 1:00 – 2:00

Show TutorPost CRUD:

- Create post
- View post
- Edit post
- Delete or explain deletion

---

## 2:00 – 3:30

Show Booking:

- Open another tutoring post
- Create booking
- Show booking request
- Accept booking
- Show booking status

---

## 3:30 – 4:15

Show:

- Search
- Explore
- My posts
- My bookings

---

## 4:15 – 5:00

Show:

- Production URL
- GitHub repository
- README
- MongoDB integration

Keep the demonstration focused on the grading requirements.

---

# 54. Grading Checklist

## Proposal – 10 Marks

Check:

- Proposal submitted on time
- Topic clearly explained
- Team members included
- Three data models defined
- Final project matches proposal

---

## Repository – 5 Marks

Check:

- GitHub repository works
- Good commit history
- All team members contributed
- README complete
- Screenshots included

---

## UI – 5 Marks

Check:

- All necessary operations have UI
- Forms work
- Navigation works
- Interface is understandable
- Responsive layout

---

## CRUD Data Models – 30 Marks

This is the MOST IMPORTANT part.

### User

```text
Create ✓
Read ✓
Update ✓
Delete ✓
```

### TutorPost

```text
Create ✓
Read ✓
Update ✓
Delete ✓
```

### Booking

```text
Create ✓
Read ✓
Update ✓
Delete ✓
```

All CRUD operations must work correctly.

---

## Deployment – 10 Marks

Check:

```text
VM deployment ✓

Working production URL ✓

No serverless deployment ✓

Application starts correctly ✓

Database connection works ✓
```

---

# 55. Development Priority

Because CRUD is worth 30 marks, development should follow this priority:

```text
1. Three CRUD models

2. Database relationships

3. Working UI

4. VM deployment

5. Authentication

6. README

7. Additional features
```

Do not prioritize animations or advanced features before CRUD is complete.

---

# 56. Minimum Viable Product

The project can be considered functionally complete when:

- Users can register.
- Users can login.
- Users can edit their profile.
- Users can create tutoring posts.
- Users can view tutoring posts.
- Users can edit their posts.
- Users can delete their posts.
- Users can create bookings.
- Users can view bookings.
- Users can update booking status.
- Users can cancel/delete bookings.
- TutorPost correctly references User.
- Booking correctly references User and TutorPost.
- The application is deployed on a VM.
- Production URL works.
- README is complete.

---

# 57. Final Project Definition

TutorLink should remain focused on this concept:

> A peer-to-peer tutoring social marketplace where every user can both offer tutoring by creating tutoring posts and request tutoring by booking tutoring sessions from other users.

The three primary CRUD models are:

```text
User

TutorPost

Booking
```

The required stack is:

```text
Next.js

MongoDB

REST API

GitHub

Virtual Machine Deployment
```

This scope should remain consistent between the proposal and the final submission.