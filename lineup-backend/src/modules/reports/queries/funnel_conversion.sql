-- Funnel: number of candidates in each stage and conversion rates between stages
SELECT
  stage,
  count(*) as count
FROM "Candidate"
WHERE "tenantId" = $1
GROUP BY stage
ORDER BY count DESC;
