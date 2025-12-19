# Performance Test Report

**Generated:** 2025-12-10T09:12:47.807Z

## Summary

| Metric | Value |
|--------|-------|
| Overall Status | **PASSED** |
| KPIs Passed | 5 / 5 |

---

## KPI Results

| KPI | Target | Actual | Status |
|-----|--------|--------|--------|
| API Response Time (p95) | < 200ms | 95.60ms | ✅ PASS |
| Page Load Time (p95) | < 2000ms | 681ms | ✅ PASS |
| Database Query Time (p95) | < 100ms | 1.19ms | ✅ PASS |
| Concurrency Error Rate | < 5% | 0.20% | ✅ PASS |
| System Uptime | > 99.5% | 99.86% | ✅ PASS |

---

## Detailed Results

### API Load Test

- Total Requests: 5000
- p50/p90/p95/p99: 38.5/78.3/95.6/145.2ms
- Error Rate: 0.20%

### Page Load Test

| Page | p95 Load Time |
|------|---------------|
| Login | 420.3ms |
| Dashboard | 680.5ms |
| Candidates | 550.2ms |
| Interviews | 520.7ms |
| Calendar | 610.3ms |
| Communication | 580.8ms |

### Database Query Benchmark

| Query | Avg | p95 |
|-------|-----|-----|
| Candidate List | 0.76ms | 0.96ms |
| Interview Scheduling | 0.77ms | 1.19ms |
| Message Log Retrieval | 0.27ms | 0.38ms |
| Tenant Usage Aggregation | 0.36ms | 0.68ms |
| Calendar Availability | 0.27ms | 0.53ms |

### Uptime Monitoring

- Uptime: 99.86%
- Avg Response: 12.5ms
