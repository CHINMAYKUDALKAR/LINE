# Scope for Improvements

## Summary

This document outlines areas for improvement in the Lineup codebase, categorized by priority and effort.

---

## 🔴 High Priority

### 1. Fix Failing Tests (7 suites)

**Status:** 7 test suites failing, 15 passing
**Root Cause:** BullMQ queue mocking issues in test setup

**Affected:**
- `auth.service.spec.ts`
- `interviews.service.spec.ts`
- `reports.service.spec.ts`
- Others with queue dependencies

**Fix:** Create proper mock providers for BullMQ queues in test modules

---

### 2. Replace console.log with Proper Logger (36 occurrences)

Many production files use `console.log` instead of NestJS Logger.

**Files affected:**
| File | Count |
|------|-------|
| `provision-test-user.ts` | 10 (script - OK) |
| `mock-*.provider.ts` | 6 (test mocks - OK) |
| `reminder.processor.ts` | 3 |
| `sync.processor.ts` | 2 |
| `bulk-import.processor.ts` | 2 |
| `google.provider.ts` | 1 |
| `outlook.provider.ts` | 1 |
| `zoho.provider.ts` | 1 |
| `salesforce.provider.ts` | 1 |
| `metrics.service.ts` | 1 |
| `logging.interceptor.ts` | 1 |
| `main.ts` | 2 |

**Fix:** Replace with `Logger.log()` from `@nestjs/common`

---

## 🟡 Medium Priority

### 3. Consolidate Duplicate Guards

Two parallel implementations exist:

| Old (common/) | New (auth/guards/) |
|---------------|-------------------|
| `common/auth.guard.ts` | `auth/guards/jwt.guard.ts` |
| `common/rbac.guard.ts` | `auth/guards/rbac.guard.ts` |

**Impact:** 6 controllers still use old guards
**Fix:** Migrate all controllers to `auth/guards/` versions, then delete old ones

---

### 4. Add Missing Test Coverage

Current coverage is incomplete. Key services need tests:

- `UsageService` (new)
- `IntegrationMetricsService` (new)
- `WhatsAppService` (new)
- All new integration providers

---

### 5. Implement OCR Stub

```typescript
// storage/utils/ocr.util.ts
console.log('OCR not implemented yet. Buffer size:', buffer.length);
```

**Fix:** Either implement with Tesseract.js or remove feature claim

---

## 🟢 Low Priority (Nice to Have)

### 6. Add Request Validation

Some endpoints accept `any` type for body:
- `bulkImport(@Body() body: any)`
- Webhook handlers

**Fix:** Create proper DTOs with class-validator decorators

---

### 7. Standardize Error Handling

Currently mixed:
- Some use custom `BusinessException`
- Some use NestJS built-in exceptions
- Some throw raw errors

**Fix:** Create consistent exception hierarchy

---

### 8. Add API Response Types

Many endpoints don't have typed responses for Swagger:
```typescript
@ApiResponse({ status: 200, description: 'Success' }) // Missing type
```

**Fix:** Add `type: SomeResponseDto` to all `@ApiResponse` decorators

---

### 9. Document Environment Variables

Some env vars are used but not documented:
- Various SSO provider configs
- Some integration-specific settings

**Fix:** Already created `REQUIRED_CONFIGURATION.txt` - keep it updated

---

### 10. Add Health Check for Integrations

Health endpoint checks DB and Redis, but not:
- External integration connectivity
- Queue worker status

**Fix:** Extend `/health/details` with integration status

---

## Performance Improvements

### 11. Database Query Optimization

Some services make N+1 queries:
```typescript
// Example: TenantUsageService.getMetrics loops through tenants
const results = await Promise.all(
    tenants.map(async (tenant) => { ... })
);
```

**Fix:** Use batch queries with `groupBy` where possible

---

### 12. Add Caching Layer

No caching for frequently accessed data:
- Tenant settings
- User permissions
- Integration configs

**Fix:** Add Redis caching with TTL for read-heavy endpoints

---

## Security Improvements

### 13. Rate Limiting on Auth Endpoints

Login endpoint has rate limiting, but:
- Password reset may need tighter limits
- API key endpoints need protection

---

### 14. Audit Log Completeness

Some admin actions may not be logged:
- Settings changes
- Integration modifications

**Fix:** Ensure all write operations log to audit

---

## Recommended Priority

1. **This Week:** Fix test suite failures
2. **Next Week:** Replace console.log with Logger
3. **Sprint 2:** Consolidate duplicate guards
4. **Sprint 3:** Add test coverage for new services
5. **Backlog:** Performance optimizations

---

*Generated: 2024-12-20*
