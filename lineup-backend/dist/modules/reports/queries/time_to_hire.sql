SELECT
    COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt"))/86400)::numeric, 1), 0)::float as "averageDays"
FROM "Candidate"
WHERE "tenantId" = $1 AND stage = 'hired' AND "deletedAt" IS NULL;
