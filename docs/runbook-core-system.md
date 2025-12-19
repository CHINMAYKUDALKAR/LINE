# Core System Runbooks

## Table of Contents
1. [API Outage](#1-api-outage)
2. [Database Connectivity Failure](#2-database-connectivity-failure)
3. [Queue Backlog / Stuck Jobs](#3-queue-backlog--stuck-jobs)
4. [Deployment Rollback](#4-deployment-rollback)

---

## 1. API Outage

### Symptoms
- Health endpoints not responding
- 5xx errors from all endpoints
- Load balancer health checks failing

### Checks
```bash
# Check health endpoints
curl -w "%{http_code}" https://lineup.app/health/live
curl -w "%{http_code}" https://lineup.app/health/ready

# Check container status
docker ps | grep backend
docker-compose logs backend --tail=50

# Check system resources
docker stats
free -m
df -h
```

### Mitigation Steps

1. **Container crashed**:
   ```bash
   # Restart backend
   docker-compose restart backend
   
   # Check logs for crash reason
   docker-compose logs backend --tail=200 | grep -i error
   ```

2. **Out of memory**:
   ```bash
   # Check memory usage
   docker stats --no-stream
   
   # Increase memory limit or restart with fresh state
   docker-compose down
   docker-compose up -d
   ```

3. **Port conflict**:
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill conflicting process or change port
   ```

4. **Bad deployment**:
   - See [Deployment Rollback](#4-deployment-rollback)

### Recovery Confirmation
- `/health/live` returns 200
- `/health/ready` returns 200
- API requests succeeding

### Post-Incident
- [ ] Review crash logs
- [ ] Check for memory leaks
- [ ] Review deployment changes

---

## 2. Database Connectivity Failure

### Symptoms
- `/health/ready` failing on database check
- "Connection refused" errors
- Timeout errors on database queries

### Checks
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check database container
docker ps | grep postgres
docker-compose logs db --tail=50

# Check connection count
psql -c "SELECT count(*) FROM pg_stat_activity"
```

### Mitigation Steps

1. **Database container down**:
   ```bash
   docker-compose up -d db
   
   # Wait for startup
   sleep 10
   
   # Verify
   docker-compose logs db --tail=20
   ```

2. **Connection pool exhausted**:
   ```bash
   # Check active connections
   psql -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state"
   
   # Terminate idle connections
   SELECT pg_terminate_backend(pid) 
   FROM pg_stat_activity 
   WHERE state = 'idle' AND query_start < NOW() - INTERVAL '1 hour';
   ```

3. **Disk full**:
   ```bash
   # Check disk space
   df -h /var/lib/postgresql/data
   
   # Clean old WAL files or expand disk
   ```

4. **Credentials invalid**:
   - Verify DATABASE_URL environment variable
   - Reset database password if needed

### Recovery Confirmation
- Database connection succeeds
- `/health/ready` passes
- Application queries working

### Post-Incident
- [ ] Review connection pool settings
- [ ] Check for connection leaks
- [ ] Monitor disk usage

---

## 3. Queue Backlog / Stuck Jobs

### Symptoms
- Queue depth continuously growing
- Jobs not being processed
- Workers reporting errors

### Checks
```bash
# Check all queue metrics
curl https://lineup.app/api/v1/system-metrics/queues

# Check Redis connection
redis-cli ping

# Check worker processes
docker-compose ps | grep worker
docker-compose logs worker --tail=50
```

### Mitigation Steps

1. **Workers not running**:
   ```bash
   # Restart workers
   docker-compose restart worker
   
   # Or scale up
   docker-compose up -d --scale worker=3
   ```

2. **Redis connection issue**:
   ```bash
   # Restart Redis
   docker-compose restart redis
   
   # Verify connection
   redis-cli ping
   ```

3. **Jobs failing repeatedly (poison message)**:
   ```bash
   # Move stuck jobs to DLQ
   # Via BullMQ admin UI or API
   
   # Check failed job details
   curl https://lineup.app/api/v1/system-metrics/queues | jq
   ```

4. **Clear queue (nuclear option)**:
   ```bash
   # Only if data loss acceptable
   redis-cli FLUSHDB
   
   # WARNING: This deletes all pending jobs
   ```

### Recovery Confirmation
- Queue depth decreasing
- Jobs completing successfully
- No new failures

### Post-Incident
- [ ] Review what caused backup
- [ ] Check for slow processors
- [ ] Consider queue partitioning

---

## 4. Deployment Rollback

### Symptoms
- New deployment causing issues
- Features broken after deploy
- Error rate spiked post-deploy

### Checks
```bash
# Check recent deployments
git log --oneline -10

# Check current version
curl https://lineup.app/health/details | jq '.version'

# Check error rate
curl https://lineup.app/api/v1/system-metrics/platform
```

### Mitigation Steps

### Quick Rollback (< 5 minutes)

```bash
# 1. Get previous image
docker images | grep lineup-backend | head -5

# 2. Rollback to previous tag
docker-compose down
docker tag lineup-backend:previous-version lineup-backend:latest
docker-compose up -d

# 3. Verify
curl https://lineup.app/health/ready
```

### Full Rollback (with database)

**Only if migration caused issues:**

```bash
# 1. Stop application
docker-compose down

# 2. Restore database backup
./scripts/restore-db.sh backups/pre-deploy-YYYYMMDD.sql.gz production

# 3. Checkout previous code
git checkout <previous-commit>

# 4. Rebuild and deploy
docker-compose build
docker-compose up -d

# 5. Verify
curl https://lineup.app/health/ready
```

### Via GitHub Actions

```bash
# Trigger rollback workflow
gh workflow run rollback.yml -f version=v1.0.0
```

### Recovery Confirmation
- Previous version running
- Error rate back to normal
- All health checks passing

### Post-Incident
- [ ] Document what caused the issue
- [ ] Fix in new deployment
- [ ] Add tests to prevent recurrence
- [ ] Update deployment checklist
