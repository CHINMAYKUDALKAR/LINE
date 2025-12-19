# Service Level Agreement (SLA) Summary

**DRAFT - FOR INTERNAL REVIEW ONLY**

*Last Updated: [DATE]*

---

## 1. Availability Commitment

| Plan | Uptime Target | Monthly Downtime Allowed |
|------|---------------|--------------------------|
| Standard | 99.5% | ~3.6 hours |
| Pro | 99.9% | ~43 minutes |
| Enterprise | 99.95% | ~22 minutes |

---

## 2. What's Included

Uptime measures availability of:
- Web application (app.lineup.app)
- API endpoints (/api/*)
- Authentication services

---

## 3. What's Excluded

The following are NOT counted as downtime:
- Scheduled maintenance (announced 48h+ in advance)
- Customer-caused issues
- Third-party integration outages
- Force majeure events
- Beta/preview features

---

## 4. Scheduled Maintenance

- Scheduled on weekends when possible
- Minimum 48 hours advance notice
- Maximum 4 hours per maintenance window
- Not more than 8 hours per month

---

## 5. Support Response Times

| Severity | Standard | Pro | Enterprise |
|----------|----------|-----|------------|
| P0 (Critical) | 24 hours | 4 hours | 1 hour |
| P1 (Major) | 48 hours | 8 hours | 4 hours |
| P2 (Moderate) | 72 hours | 24 hours | 8 hours |
| P3 (Minor) | 5 days | 48 hours | 24 hours |

---

## 6. Support Channels

| Channel | Standard | Pro | Enterprise |
|---------|----------|-----|------------|
| Email | ✅ | ✅ | ✅ |
| Chat | ❌ | ✅ | ✅ |
| Phone | ❌ | ❌ | ✅ |
| Dedicated CSM | ❌ | ❌ | ✅ |

---

## 7. Service Credits

If uptime falls below commitment:

| Uptime | Credit |
|--------|--------|
| 99.0% - 99.5% | 10% of monthly fee |
| 98.0% - 99.0% | 25% of monthly fee |
| < 98.0% | 50% of monthly fee |

### Credit Request Process
1. Submit request within 30 days of incident
2. Provide incident dates and impact
3. Credits applied to next invoice

### Maximum Credit
- Maximum 50% of monthly fee per month
- Credits are not refundable

---

## 8. Remedies

Service credits are the sole remedy for SLA breaches. This SLA does not modify contractual liability limits.

---

## 9. Escalation Path

| Level | Contact | Timeframe |
|-------|---------|-----------|
| 1 | Support Team | Initial response |
| 2 | Support Manager | After 2x response time |
| 3 | Engineering Lead | After 4x response time |
| 4 | Executive | P0 unresolved > 4 hours |

---

## 10. Monitoring

- Health status: status.lineup.app (when available)
- Incident notifications via email
- Post-incident reports for P0/P1

---

*This is a draft document for internal review. Final version requires legal counsel approval.*
