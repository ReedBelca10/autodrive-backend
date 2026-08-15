Deployment checklist and secure configuration for AutoDrive backend

1) Environment variables
- Keep secrets out of source control. Commit only `.env.example`.
- Use a secrets manager (GitHub Secrets, Vault, cloud provider secrets).

2) Running locally with Docker
- Build image: `docker build -t autodrive-backend:latest .`
- Run (example):
  `docker run --env-file .env -p 3001:3001 autodrive-backend:latest`

3) Recommended production setup
- Use managed MongoDB (Atlas) and avoid embedding credentials in images.
- Use a process manager (PM2 or systemd) or run via container orchestrator (Kubernetes, ECS).
- Terminate TLS at a reverse proxy (NGINX/Traefik) or use cloud load balancer with certificates.

4) CI/CD notes
- Use `/.github/workflows/ci-cd.yml` to build, test, and push images. Configure `REGISTRY_*` secrets.

5) Security hardening
- Use read-only service accounts when possible. Rotate secrets regularly.
- Set `NODE_ENV=production` and ensure debug endpoints are disabled.
- Limit container user privileges (`USER node` in Dockerfile).
