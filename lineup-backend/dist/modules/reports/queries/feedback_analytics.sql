-- Feedback analytics: avg rating per interviewer and per candidate
SELECT
  'interviewer' as entity,
  f."interviewerId" as entityId,
  avg(f.rating)::numeric(10,2) as avg_rating,
  count(*) as feedback_count
FROM "Feedback" f
WHERE f."tenantId" = $1
GROUP BY f."interviewerId"
UNION ALL
SELECT
  'candidate' as entity,
  i."candidateId" as entityId,
  avg(f.rating)::numeric(10,2) as avg_rating,
  count(*) as feedback_count
FROM "Feedback" f
JOIN "Interview" i ON i.id = f."interviewId"
WHERE f."tenantId" = $1
GROUP BY i."candidateId";
