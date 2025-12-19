# Disaster Recovery Runbook

## Overview

This document outlines the disaster recovery procedures for Lineup. Follow these steps in case of data loss, service outage, or security incident.

---

## Emergency Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| On-Call Engineer | [TBD] | First responder |
| Database Admin | [TBD] | Data recovery |
| Security Lead | [TBD] | Security incidents |

---

## 1. Database Recovery

### 1.1 Complete Database Restore

Use this procedure for complete database loss or corruption.

```bash
# 1. List available backups
ls -la backups/

# 2. Verify backup checksum
sha256sum -c backups/lineup_production_YYYYMMDD.sql.gz.sha256

# 3. Stop application (prevent writes)
docker-compose down

# 4. Restore from backup
./scripts/restore-db.sh backups/lineup_production_YYYYMMDD.sql.gz production

# 5. Verify data integrity
npx prisma db pull
npm run test:e2e

# 6. Restart application
docker-compose up -d

# 7. Verify health
curl http://localhost:3000/health/ready
```

### 1.2 Point-in-Time Recovery

For recovering to a specific point before an incident:

```bash
# If using PostgreSQL WAL archiving:
# 1. Stop PostgreSQL
# 2. Restore base backup
# 3. Configure recovery.conf with target_time
# 4. Start PostgreSQL
```

---

## 2. Application Recovery

### 2.1 Rollback to Previous Version

```bash
# 1. Get previous image tag
docker images | grep lineup-backend

# 2. Update docker-compose with previous tag
# Edit docker-compose.yml: image: lineup-backend:previous-tag

# 3. Pull and restart
docker-compose pull
docker-compose up -d

# 4. Verify
curl http://localhost:3000/health/ready
```

### 2.2 Full Application Redeployment

```bash
# 1. Clone repository
git clone https://github.com/org/lineup.git
cd lineup

# 2. Checkout stable version
git checkout v1.0.0  # or last known good commit

# 3. Build images
docker-compose build

# 4. Start services
docker-compose up -d

# 5. Run migrations
./scripts/migrate.sh production
```

---

## 3. Service-Specific Recovery

### 3.1 Redis Recovery

```bash
# Redis is used for sessions, rate limiting, and queues
# Data loss is acceptable - rebuild caches on startup

# 1. Stop Redis
docker-compose stop redis

# 2. Clear data (if corrupted)
docker volume rm lineup_redis_data

# 3. Restart Redis
docker-compose up -d redis

# 4. Application will automatically reconnect
```

### 3.2 File Storage (MinIO/S3) Recovery

```bash
# 1. Restore from S3 backup or replica
aws s3 sync s3://backup-bucket/files s3://production-bucket/files

# 2. Verify file access
curl http://localhost:9000/minio/health/live
```

---

## 4. Verification Checklist

After any recovery, verify:

- [ ] Health endpoints respond: `GET /health/ready`
- [ ] Database connectivity: `GET /health/details`
- [ ] User can log in
- [ ] Recent data is present
- [ ] Background jobs are processing
- [ ] Email notifications working
- [ ] File uploads working

---

## 5. Post-Incident

### 5.1 Incident Report

Document:
1. **Timeline**: When did it start/end?
2. **Impact**: What was affected?
3. **Root Cause**: Why did it happen?
4. **Resolution**: How was it fixed?
5. **Prevention**: How do we prevent recurrence?

### 5.2 Backup Verification

After incidents, verify backup integrity:

```bash
# Create test database
createdb lineup_backup_test

# Restore to test database
DATABASE_URL=postgresql://user:pass@localhost/lineup_backup_test \
  ./scripts/restore-db.sh backups/latest.sql.gz

# Verify row counts match production
psql -c "SELECT COUNT(*) FROM users"
```

---

## 6. Backup Schedule

| Backup Type | Frequency | Retention | Location |
|-------------|-----------|-----------|----------|
| Full DB | Daily 2AM | 30 days | S3/Local |
| Incremental | Hourly | 7 days | S3/Local |
| WAL Archive | Continuous | 7 days | S3 |

---

## 7. Runbook Testing

This runbook should be tested quarterly:

- [ ] Q1: Database restore test
- [ ] Q2: Application rollback test
- [ ] Q3: Full disaster simulation
- [ ] Q4: Backup verification

**Last tested**: [DATE]
**Tested by**: [NAME]
