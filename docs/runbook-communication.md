# Communication System Runbooks

## Table of Contents
1. [Email Provider Failure](#1-email-provider-failure)
2. [SMS Delivery Failure](#2-sms-delivery-failure)
3. [WhatsApp Delivery Failure](#3-whatsapp-delivery-failure)
4. [High Retry Volume](#4-high-retry-volume)

---

## 1. Email Provider Failure

### Symptoms
- Emails not being delivered
- High failure rate in MessageLog
- SMTP connection errors in logs
- SES quota exceeded errors

### Checks
```bash
# Check email queue
curl https://lineup.app/api/v1/system-metrics/queues | jq '.[] | select(.queue=="email")'

# Check recent failures
SELECT channel, status, COUNT(*) 
FROM message_logs 
WHERE channel = 'EMAIL' AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY channel, status;

# Check SMTP connectivity
telnet smtp.example.com 587
```

### Mitigation Steps

**For SMTP failures:**
1. Verify SMTP credentials are valid
2. Check SMTP server status
3. Test connection:
   ```bash
   curl --url 'smtp://smtp.example.com:587' \
     --mail-from 'test@lineup.app' \
     --mail-rcpt 'test@example.com' \
     --upload-file /dev/null
   ```

**For AWS SES failures:**
1. Check SES dashboard for quota/reputation
2. Verify IAM permissions
3. Check sending limits:
   ```bash
   aws ses get-send-quota
   ```

**Switch to backup provider (if configured):**
```bash
# Update tenant channel config to use backup SMTP
curl -X PATCH https://lineup.app/api/v1/communication/channels/email \
  -d '{"provider": "smtp_backup"}'
```

### Recovery Confirmation
- Test email sends successfully
- Queue depth decreasing
- Failure rate returning to normal

### Post-Incident
- [ ] Review why provider failed
- [ ] Consider adding backup provider
- [ ] Check bounce/complaint rates

---

## 2. SMS Delivery Failure

### Symptoms
- SMS messages not delivered
- Twilio API errors in logs
- High SMS queue depth

### Checks
```bash
# Check SMS queue
curl https://lineup.app/api/v1/system-metrics/queues | jq '.[] | select(.queue=="sms")'

# Check Twilio status
curl https://status.twilio.com

# Check recent SMS failures
SELECT status, COUNT(*), MAX(metadata->>'error') as error
FROM message_logs 
WHERE channel = 'SMS' AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY status;
```

### Mitigation Steps

1. **Verify Twilio credentials**:
   - Check account SID and auth token
   - Verify sending phone number is active

2. **Check for common errors**:
   - Invalid phone number format → Skip or queue for review
   - Unsubscribed recipient → Mark as do-not-contact
   - Carrier rejection → Review message content

3. **If Twilio is down**:
   - SMS will queue and retry automatically
   - Consider falling back to WhatsApp for urgent messages

4. **Retry failed messages**:
   ```bash
   # Via admin console or API
   curl -X POST https://lineup.app/api/v1/communication/retry-failed?channel=SMS
   ```

### Recovery Confirmation
- Test SMS delivers successfully
- Queue processing normally
- Delivery receipts being received

### Post-Incident
- [ ] Review failed phone numbers
- [ ] Check for carrier-specific issues
- [ ] Review message content if rejected

---

## 3. WhatsApp Delivery Failure

### Symptoms
- WhatsApp messages not delivered
- Meta API errors (Graph API)
- Template rejection errors

### Checks
```bash
# Check WhatsApp queue
curl https://lineup.app/api/v1/system-metrics/queues | jq '.[] | select(.queue=="whatsapp")'

# Check Meta Business status
# Visit: https://developers.facebook.com/support/bugs/

# Check template status
curl "https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/message_templates" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Mitigation Steps

1. **Template rejected**:
   - Review template content for policy violations
   - Submit new template for approval
   - Use approved fallback template

2. **24-hour window expired**:
   - Can only send template messages (not free-form)
   - Wait for user to initiate conversation

3. **Phone number issues**:
   - Verify number is registered with WhatsApp Business
   - Check quality rating in Meta Business Manager

4. **Access token expired**:
   - Refresh long-lived token
   - Update in tenant channel config

### Recovery Confirmation
- Test message delivers via WhatsApp
- Queue processing without errors
- Delivery receipts received

### Post-Incident
- [ ] Review template approval status
- [ ] Check message quality metrics
- [ ] Verify token refresh is automated

---

## 4. High Retry Volume

### Symptoms
- Queue depth not decreasing
- Same messages retrying repeatedly
- DLQ (dead letter queue) growing

### Checks
```bash
# Check all queues
curl https://lineup.app/api/v1/system-metrics/queues

# Check DLQ size
curl https://lineup.app/api/v1/system-metrics/queues | jq '.[] | select(.queue=="communication-dlq")'

# Check retry patterns
SELECT status, retry_count, COUNT(*) 
FROM message_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY status, retry_count
ORDER BY retry_count DESC;
```

### Mitigation Steps

1. **Identify pattern**:
   - Same error for all retries? → Systemic issue
   - Different errors? → Multiple root causes

2. **Stop the retry loop** (if amplifying problem):
   ```bash
   # Pause specific queue
   # Via BullMQ admin: pause queue
   
   # Or reduce retry attempts temporarily
   ```

3. **Clear poison messages**:
   ```bash
   # Move to DLQ for manual review
   # Via admin: Communication → Failed Messages → Move to DLQ
   ```

4. **Address root cause** before resuming:
   - Fix provider connection
   - Update invalid data
   - Increase rate limits

5. **Resume with controlled rate**:
   ```bash
   # Process DLQ in batches
   # Via admin: Communication → DLQ → Retry Batch
   ```

### Recovery Confirmation
- Queue depth stabilizing
- Retry rate returning to normal
- DLQ not growing

### Post-Incident
- [ ] Review DLQ contents
- [ ] Clean up permanently failed messages
- [ ] Adjust retry strategy if needed
