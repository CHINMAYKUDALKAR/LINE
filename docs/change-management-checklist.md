# Change Management Checklist

## Pre-Deployment Checklist

Before every production deployment:

### Code Readiness
- [ ] All CI checks passing (tests, lint, build)
- [ ] Code reviewed and approved
- [ ] PR merged to main branch

### Database
- [ ] Migrations reviewed for safety
- [ ] Migrations tested on staging
- [ ] No destructive operations (DROP, DELETE) without approval
- [ ] Database backup scheduled/completed

### Testing
- [ ] Feature tested on staging
- [ ] Regression tests passing
- [ ] Performance impact assessed

### Rollback Plan
- [ ] Previous version identified
- [ ] Rollback steps documented
- [ ] Database rollback plan if needed
- [ ] Estimated rollback time: _____ minutes

### Communication
- [ ] Team notified of deployment window
- [ ] On-call engineer aware
- [ ] Customer communication prepared (if breaking change)

### Feature Flags (if applicable)
- [ ] New feature behind flag
- [ ] Flag default is OFF
- [ ] Gradual rollout plan defined

---

## Deployment Execution

### 1. Start Deployment
- [ ] Notify team: "Starting deployment"
- [ ] Create database backup
- [ ] Note current version: _____

### 2. Deploy
- [ ] Run deployment command
- [ ] Monitor deployment logs
- [ ] Watch for errors

### 3. Initial Verification
- [ ] Health checks passing
- [ ] No startup errors

---

## Post-Deployment Checklist

### Immediate (< 5 minutes)
- [ ] Health endpoints responding
  - `GET /health/live` → 200
  - `GET /health/ready` → 200
- [ ] Version updated in `/health/details`
- [ ] No error spikes in logs

### Short-term (5-15 minutes)
- [ ] Error rate normal (< 1%)
- [ ] Response times normal (< 500ms p95)
- [ ] Queue processing normally
- [ ] No failed jobs accumulating

### Functional (15-30 minutes)
- [ ] User login works
- [ ] Dashboard loads
- [ ] Core features functional
- [ ] Integrations syncing

### Monitoring (1 hour)
- [ ] Error rate stable
- [ ] No user-reported issues
- [ ] Metrics within normal range

---

## Deployment Sign-off

```
Deployment completed: [DATE TIME]
Deployed by: [NAME]
Version: [VERSION]
Status: [ ] SUCCESS / [ ] ROLLED BACK

Notes:
_________________________________
_________________________________
```

---

## Rollback Decision Criteria

### Roll back immediately if:
- Health checks failing > 2 minutes
- Error rate > 5%
- Core functionality broken
- Data corruption detected

### Investigate first if:
- Minor feature broken
- Performance slightly degraded
- Non-critical errors appearing

### Do NOT roll back if:
- Cosmetic issues only
- Single user affected
- Error rate within normal variance

---

## Emergency Contacts

| Role | Contact | When to Contact |
|------|---------|-----------------|
| On-call Engineer | [Phone/Slack] | First responder |
| Engineering Lead | [Phone/Slack] | Escalation |
| Database Admin | [Phone/Slack] | Data issues |
| Security Lead | [Phone/Slack] | Security incident |
