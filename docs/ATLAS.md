# Optional MongoDB Atlas connection

The requested cluster is `cluster0.cnyc2gc.mongodb.net`, database user `u6622062_db_user`. Use the `tutorlink` database explicitly in the connection string. A real database password is still required; the placeholder is not a working credential.

MongoDB Atlas is a managed service. This option conflicts with the original `instruction.md` restriction on managed backend services. The existing self-hosted database remains the default until a complete `MONGODB_URI` is supplied.

## Local VS Code setup

Create an ignored `.env.local` beside `package.json` using `deploy/atlas.env.example`. Replace the password placeholder with the URL-encoded password and use a real JWT secret. Do not include the VM's base-path settings in a local environment file.

`npm run dev` now loads `.env.local` before selecting its database. With `MONGODB_URI` set, it uses that database and does not start the bundled MongoDB or automatically insert demo accounts. With no URI set, local development continues to use the existing local MongoDB and sample data.

## Atlas access

Allow your computer's public IP for local development and the VM's outbound public IP for production in the Atlas project's Network Access IP access list. Give the database user read/write access to `tutorlink`. See [MongoDB Atlas connection documentation](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/).

## Live VM configuration

Add the complete `MONGODB_URI` to `/home/azureuser/TutorLink/.env`, keeping its existing JWT secret, HTTPS origin, base path, and port. Compose accepts that URI as an override; without it, the self-hosted MongoDB connection is used.

Changing a connection string does not migrate records. Before switching live traffic, validate the Atlas connection, back up the existing database, and transfer the existing records if they should be preserved. Keep the original Docker volume for rollback. The live app has been configured to use the requested Atlas cluster. Its URI was corrected to select `tutorlink`; at the last connection check, Atlas network access still required allowing the VM IP `135.235.218.11`. No data migration has been performed. The original self-hosted Docker volume is retained.
