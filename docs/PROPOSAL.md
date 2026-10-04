# TutorLink — Peer Tutoring Social Marketplace

Proposal draft for KAUNG ZAW HEIN, MOE MYINT CHO, and SHAUN LAI KYAW SAN. Submit it through the lecturer’s required process before the deadline.

## Description

TutorLink is a peer-to-peer tutoring marketplace for university students. Every member can both offer and request tutoring using one account. Members publish tutoring offers with a subject, description, hourly price, method, location, and availability. Other members search those offers and request sessions. Post owners accept or reject requests and mark finished sessions as completed.

## Scope

- Registration, sign-in, public profiles, profile editing, and account deletion.
- Create, view, search, filter, edit, deactivate, and delete tutoring posts.
- Request, view, reschedule pending, cancel, and delete resolved bookings.
- Tutor acceptance, rejection, and completion of sessions.
- REST CRUD APIs for User, TutorPost, and Booking, with ownership checks and input validation.
- Responsive user interface and self-hosted deployment on a VM.

## Technology and relationships

Next.js with TypeScript, MongoDB with Mongoose, and REST APIs. TutorPost references its User owner. Booking references TutorPost, student User, and tutor User. MongoDB transactions preserve relationships during deletion and concurrent booking creation.

Source will be stored on GitHub with each actual team member contributing their own commits. Production will run on an Ubuntu VM behind Nginx with HTTPS, with MongoDB hosted on the same VM.

## Out of scope

Online payments, ratings, reviews, real-time chat, video calling, AI recommendations, and university SSO. These can be evaluated as future senior-project improvements.

## Team and submission

- KAUNG ZAW HEIN — https://github.com/NYOWI1
- MOE MYINT CHO — https://github.com/MoeMyintCho
- SHAUN LAI KYAW SAN — https://github.com/SHAUN14487

Repository: https://github.com/NYOWI1/TutorLink

VM target: nyxen.centralindia.cloudapp.azure.com
Proposal submission, deadlines, the final five-minute demonstration recording, and individual contributions are the team’s responsibility. The implemented app follows the scope above.
