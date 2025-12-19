# Deployment Runbook

## Overview

This document describes the deployment process for Lineup across all environments.

---

## Environments

| Environment | Purpose | URL | Deploy Trigger |
|-------------|---------|-----|----------------|
| **Dev** | Development testing | dev.lineup.app | Auto on main merge |
| **Staging** | Pre-production validation | staging.lineup.app | Manual |
| **Production** | Live users | lineup.app | Manual approval |

---

## Pre-Deployment Checklist

Before any deployment:

- [ ] All CI checks pass
- [ ] No critical bugs in staging
- [ ] Database migrations reviewed
- [ ] Breaking changes documented
- [ ] Rollback plan ready

---

## 1. Standard Deployment (via GitHub Actions)

### 1.1 Deploy to Dev

Automatic on merge to `main` branch.

```bash
# Verify deployment
curl https://dev.lineup.app/health/ready
```

### 1.2 Deploy to Staging

```bash
# Via GitHub Actions workflow_dispatch
gh workflow run deploy.yml -f environment=staging

# Or via GitHub UI:
# Actions → Deploy → Run workflow → Select "staging"
```

### 1.3 Deploy to Production

**Requires manual approval in GitHub Environments**

```bash
# Via GitHub Actions
gh workflow run deploy.yml -f environment=production

# Then approve in GitHub UI
```

---

## 2. Manual Deployment

For emergency deployments or debugging.

### 2.1 SSH Deployment

```bash
# 1. SSH to server
ssh deploy@lineup-prod

# 2. Navigate to app directory
cd /app/lineup

# 3. Pull latest changes
git pull origin main

# 4. Backup database
./scripts/backup-db.sh production

# 5. Build images
docker-compose build

# 6. Run migrations (dry run first)
./scripts/migrate.sh production --dry-run
./scripts/migrate.sh production

# 7. Deploy with zero downtime
docker-compose up -d --no-deps backend
docker-compose up -d --no-deps frontend

# 8. Verify
curl http://localhost:3000/health/ready
```

### 2.2 Docker Deployment

```bash
# Pull pre-built images
docker pull ghcr.io/org/lineup-backend:v1.0.0
docker pull ghcr.io/org/lineup-frontend:v1.0.0

# Tag as latest
docker tag ghcr.io/org/lineup-backend:v1.0.0 lineup-backend:latest

# Restart services
docker-compose up -d
```

---

## 3. Database Migrations

### 3.1 Safe Migration Process

```bash
# 1. Review pending migrations
npx prisma migrate status

# 2. Dry run
./scripts/migrate.sh production --dry-run

# 3. Create backup
./scripts/backup-db.sh production

# 4. Apply migrations
./scripts/migrate.sh production

# 5. Verify
npx prisma migrate status
```

### 3.2 Migration Rollback

**Prisma does not support automatic rollbacks.** For schema rollbacks:

1. Restore from pre-migration backup
2. Revert code to previous version
3. Deploy previous version

---

## 4. Rollback Procedures

### 4.1 Quick Rollback (Image)

```bash
# Get previous image tag
docker images | grep lineup

# Update compose file
sed -i 's/lineup-backend:latest/lineup-backend:previous-tag/' docker-compose.yml

# Restart
docker-compose up -d
```

### 4.2 Full Rollback (Code + DB)

```bash
# 1. Identify last good commit
git log --oneline

# 2. Restore database
./scripts/restore-db.sh backups/pre-deploy-backup.sql.gz production

# 3. Checkout previous version
git checkout <good-commit>

# 4. Rebuild and deploy
docker-compose build
docker-compose up -d
```

---

## 5. Post-Deployment Verification

### Health Checks

```bash
# Liveness
curl https://lineup.app/health/live

# Readiness
curl https://lineup.app/health/ready

# Details
curl https://lineup.app/health/details
```

### Functional Verification

- [ ] Homepage loads
- [ ] User can log in
- [ ] Dashboard displays data
- [ ] Create candidate works
- [ ] Schedule interview works

### Monitoring

- Check error rates in logs
- Verify queue processing
- Monitor response times

---

## 6. Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend --tail=100

# Check for port conflicts
lsof -i :3000

# Check resources
docker stats
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check container network
docker network inspect lineup-network
```

### Health Check Failing

```bash
# Check readiness endpoint
curl -v http://localhost:3000/health/ready

# Check logs for errors
docker-compose logs backend | grep -i error
```

---

## 7. Emergency Procedures

### Immediate Rollback

```bash
# One-liner rollback
docker-compose down && \
  git checkout HEAD~1 && \
  docker-compose build && \
  docker-compose up -d
```

### Put Site in Maintenance Mode

```bash
# Deploy maintenance page
docker-compose up -d maintenance

# Or at load balancer level
# Update nginx/ALB to return 503
```

### Contact List

| Issue | Contact | Action |
|-------|---------|--------|
| Deploy failure | On-call engineer | Rollback |
| Data issue | Database admin | Restore |
| Security incident | Security lead | Isolate |
