SELECT stage,
COUNT(*) FILTER (WHERE "overallScore" IS NOT NULL) AS with_score,
AVG("overallScore") AS avg_score
FROM "Candidate"
WHERE "tenantId" = $1
GROUP BY stage;
