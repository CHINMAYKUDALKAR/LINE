SELECT
    source,
    COUNT(*)::int as "totalCandidates",
    COUNT(CASE WHEN stage = 'hired' THEN 1 END)::int as hired,
    COUNT(CASE WHEN stage = 'rejected' THEN 1 END)::int as rejected,
    COALESCE(ROUND(AVG(CASE WHEN stage = 'hired' THEN EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))/86400 END)::numeric, 1), 0)::float as "avgDaysToHire"
FROM "Candidate"
WHERE "tenantId" = $1 AND source IS NOT NULL AND "deletedAt" IS NULL
GROUP BY source
ORDER BY "totalCandidates" DESC;
