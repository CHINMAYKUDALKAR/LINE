# Integration Runbooks

## Table of Contents
1. [CRM/ATS Provider Downtime](#1-crmats-provider-downtime)
2. [OAuth Token Expiry](#2-oauth-token-expiry)
3. [Rate Limit Exhaustion](#3-rate-limit-exhaustion)
4. [Partial Sync Failures](#4-partial-sync-failures)

---

## 1. CRM/ATS Provider Downtime

### Symptoms
- Integration status shows "error"
- Sync logs showing connection failures
- Provider API returning 5xx errors

### Checks
```bash
# Check integration status
curl -H "Authorization: Bearer $TOKEN" \
  https://lineup.app/api/v1/integrations/status

# Check provider status page
# HubSpot: status.hubspot.com
# Salesforce: status.salesforce.com
# Greenhouse: status.greenhouse.io
# Lever: status.lever.co
```

### Mitigation Steps
1. **Verify provider status** - Check their status page
2. **If provider is down**: No action needed, retries will resume when up
3. **If provider is up but we can't connect**:
   ```bash
   # Test connectivity from server
   curl -v https://api.hubspot.com/health
   
   # Check for network issues
   docker exec backend ping api.hubspot.com
   ```
4. **Disable integration temporarily** (if causing cascading failures):
   ```bash
   curl -X PATCH \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     https://lineup.app/api/v1/admin/tenants/{tenantId}/integrations/{provider} \
     -d '{"enabled": false}'
   ```

### Recovery Confirmation
- Integration status shows "connected"
- Sync logs show successful operations
- No error alerts in last 15 minutes

### Post-Incident
- [ ] Check if any data needs manual sync
- [ ] Review failed sync logs for retryable items
- [ ] Update status in incident tracker

---

## 2. OAuth Token Expiry

### Symptoms
- 401 Unauthorized errors in sync logs
- "Token expired" or "Invalid grant" errors
- Integration marked as "needs_reauth"

### Checks
```bash
# Check integration status
curl -H "Authorization: Bearer $TOKEN" \
  https://lineup.app/api/v1/integrations/{provider}/status

# Check token expiry in database
SELECT expires_at, last_refreshed_at 
FROM integrations 
WHERE tenant_id = '...' AND provider = '...';
```

### Mitigation Steps
1. **For providers with refresh tokens** (auto-refresh should occur):
   ```bash
   # Force token refresh
   curl -X POST \
     https://lineup.app/api/v1/integrations/{provider}/refresh
   ```

2. **If refresh fails** (refresh token also expired):
   - User must re-authorize the integration
   - Navigate to Settings → Integrations → Reconnect

3. **For API key providers** (Greenhouse, Workday):
   - Verify API key is still valid in provider dashboard
   - Update credentials if rotated

### Recovery Confirmation
- Token successfully refreshed
- Test API call succeeds
- Sync resumes normally

### Post-Incident
- [ ] Check if token rotation is needed
- [ ] Review refresh token TTL settings
- [ ] Consider implementing proactive refresh

---

## 3. Rate Limit Exhaustion

### Symptoms
- 429 Too Many Requests errors
- Sync operations queuing up
- Exponential backoff in logs

### Checks
```bash
# Check rate limit headers in recent responses
grep "X-RateLimit" /var/log/lineup/integrations.log | tail -20

# Check queue depth
curl https://lineup.app/api/v1/system-metrics/queues
```

### Mitigation Steps
1. **Wait for rate limit reset** (usually 1 hour window)

2. **Identify root cause**:
   - Bulk import causing spike?
   - Multiple tenants hitting same provider?
   - Retry loop amplifying requests?

3. **Reduce request rate temporarily**:
   ```bash
   # Pause non-critical syncs
   # Via admin console: Settings → Integrations → Pause Sync
   ```

4. **If urgent data needed**:
   - Prioritize specific records
   - Use provider's bulk export if available

### Recovery Confirmation
- Rate limit headers show available quota
- Syncs processing without 429 errors
- Queue depth returning to normal

### Post-Incident
- [ ] Review request patterns
- [ ] Consider batching optimizations
- [ ] Check if higher rate limit tier needed

---

## 4. Partial Sync Failures

### Symptoms
- Some records syncing, others failing
- Validation errors in sync logs
- Data mismatch between systems

### Checks
```bash
# Check sync logs for failures
curl https://lineup.app/api/v1/integrations/{provider}/sync-logs?status=FAILED

# Check failure summary
curl https://lineup.app/api/v1/integrations/{provider}/failures
```

### Mitigation Steps
1. **Identify failure pattern**:
   - Field validation errors → Fix data format
   - Missing required fields → Update mapping
   - Duplicate records → Resolve conflict

2. **For validation errors**:
   ```bash
   # Review failed record details
   curl https://lineup.app/api/v1/integrations/{provider}/sync-logs/{logId}
   ```

3. **For mapping issues**:
   - Review field mappings in integration settings
   - Update mappings to match provider schema changes

4. **Retry failed syncs**:
   ```bash
   curl -X POST \
     https://lineup.app/api/v1/integrations/{provider}/retry-failed
   ```

### Recovery Confirmation
- Retry succeeds for previously failed records
- No new failures with same error type
- Data consistent between systems

### Post-Incident
- [ ] Update validation logic if needed
- [ ] Document any mapping changes
- [ ] Review for similar issues in other integrations
