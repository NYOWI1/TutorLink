# Deploy TutorLink on an Ubuntu VM

The app and MongoDB run on your own VM. This setup uses Docker Compose and a host Nginx reverse proxy. It does not use serverless hosting or a managed backend.

## Before deployment

Supply a GitHub repository, VM SSH access, and a domain pointing to that VM. Use an Ubuntu VM with at least 2 GB RAM (4 GB recommended for builds), Docker Engine with Compose, Git, Nginx, and Certbot. Node 24 is needed only if building outside Docker.

1. Push this original project to your GitHub repository. Each real contributor should create their own meaningful commits.
2. Clone the repository on the VM and change into it.
3. Generate a secret with `openssl rand -hex 48`.
4. Create an untracked `.env` with `JWT_SECRET=<generated secret>`, `APP_ORIGIN=https://nyxen.centralindia.cloudapp.azure.com`, `NEXT_PUBLIC_BASE_PATH=/tutorlink`, and `APP_PORT=3002`.
5. Run `docker compose up -d --build`. MongoDB will initialize a single-node replica set; the app starts after MongoDB is healthy. A replica set is required for the transaction-based booking and deletion operations.

The app is bound to **127.0.0.1:3002**. MongoDB has no published port and runs on an internal Docker network. Do not expose port 27017. MongoDB authorization is disabled inside this isolated network; if you change that network architecture, configure MongoDB authorization and a replica-set keyfile first.

## HTTPS and Nginx

Production session cookies require HTTPS.

1. The supplied VM already has Nginx and a certificate for the domain. Keep port 3002 private.
2. Copy `deploy/nginx-location.conf` to `/etc/nginx/snippets/tutorlink.conf`.
3. Inside the existing HTTPS server block, add `include /etc/nginx/snippets/tutorlink.conf;`. Back up the original configuration first.
4. Run `sudo nginx -t`, then `sudo systemctl reload nginx`.
5. Visit **https://nyxen.centralindia.cloudapp.azure.com/tutorlink**. Register real users; sample accounts are not created by the production image.

The isolated `/tutorlink` routes preserve the VM’s existing `/api`, `/content`, and `/project` services. For a separate VM serving TutorLink at its root, omit `NEXT_PUBLIC_BASE_PATH`, use port 3000, and adapt `deploy/nginx.conf`.

The first run of local development seeds demo accounts automatically. Never copy the local `.data` folder into production. To seed an external development database, set `MONGODB_URI` and run `npm run seed` from a full source checkout.

## Verification

- `docker compose ps`: both services should be healthy.
- Register and sign in through HTTPS.
- Edit a profile and view another member’s public profile.
- Create, edit, deactivate, and delete a tutoring post.
- From a second account, request a valid future session.
- Edit the pending request, accept or reject it as the tutor, and cancel it as the student.
- Completion becomes available after the session’s scheduled end.
- Delete a resolved booking and delete a test account.
- Try an unauthorized edit and an invalid booking; each must be rejected.
- Check mobile layout and add the real production URL to README.

## Operations

Update: `git pull`, then `docker compose up -d --build`.

Logs: `docker compose logs --tail=100 app mongo`.

Back up: `docker compose exec -T mongo mongodump --archive --gzip > tutorlink-backup.archive.gz`.

Restore: `docker compose exec -T mongo mongorestore --archive --gzip < tutorlink-backup.archive.gz` (review overwrite options before restoring into an existing database).

`docker compose down` preserves the data volume. `docker compose down -v` **deletes all database data**. Keep regular off-VM backups.

## Deployment status

The files are prepared for VM deployment. The target is nyxen.centralindia.cloudapp.azure.com and the repository is https://github.com/NYOWI1/TutorLink. A live deployment requires verified SSH access and has not yet been performed or verified.
