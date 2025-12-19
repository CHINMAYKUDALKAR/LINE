# Incident Classification & Response

## Severity Levels

### P0 — Critical Outage
**Impact**: Complete service outage or data corruption risk
- All users unable to access system
- Database corruption detected
- Security breach confirmed
- Data loss occurring

**Response Time**: Immediate (< 15 min)
**Escalation**: On-call → Engineering Lead → CTO
**Communication**: All-hands + customer notification

### P1 — Major Functionality Broken
**Impact**: Core features unavailable for all users
- Scheduling completely broken
- All integrations failing
- Authentication not working
- No emails/notifications sending

**Response Time**: < 30 minutes
**Escalation**: On-call → Engineering Lead
**Communication**: Affected teams notified

### P2 — Partial Degradation
**Impact**: Some features impaired, workarounds exist
- Single integration failing
- Slow response times (> 5s)
- High retry rates
- Partial sync failures

**Response Time**: < 2 hours
**Escalation**: On-call engineer
**Communication**: Internal tracking only

### P3 — Minor Issue
**Impact**: Cosmetic or low-impact issues
- UI inconsistencies
- Non-blocking errors
- Performance not meeting SLA but functional

**Response Time**: Next business day
**Escalation**: Standard ticketing
**Communication**: None required

---

## Escalation Matrix

| Severity | First Responder | 30min No Resolution | 1hr No Resolution |
|----------|-----------------|---------------------|-------------------|
| P0 | On-call Engineer | Engineering Lead | CTO |
| P1 | On-call Engineer | Engineering Lead | - |
| P2 | On-call Engineer | - | - |
| P3 | Ticket queue | - | - |

---

## On-Call Responsibilities

1. **Monitor alerts** and health dashboards
2. **Acknowledge** incidents within SLA
3. **Diagnose** using runbooks
4. **Mitigate** or escalate if blocked
5. **Document** actions taken
6. **Handoff** with context at shift end

---

## Incident Response Workflow

```
1. DETECT → Alert triggered or user report
     ↓
2. CLASSIFY → Assign P0/P1/P2/P3
     ↓
3. ACKNOWLEDGE → Assign owner, start timer
     ↓
4. DIAGNOSE → Follow relevant runbook
     ↓
5. MITIGATE → Apply fix or workaround
     ↓
6. VERIFY → Confirm resolution
     ↓
7. DOCUMENT → Post-incident report
```

---

## Decision Authority

| Action | P0/P1 | P2/P3 |
|--------|-------|-------|
| Rollback deployment | On-call can decide | Engineering Lead approval |
| Disable integration | On-call can decide | Standard process |
| Restore from backup | Engineering Lead | Engineering Lead |
| Customer communication | CTO approval | Not required |
