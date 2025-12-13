SELECT
    stage,
    COUNT(*)::int as count,
    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ())::numeric, 1)::float as percentage
FROM "Candidate"
WHERE "tenantId" = $1 AND "deletedAt" IS NULL
GROUP BY stage
ORDER BY count DESC;
