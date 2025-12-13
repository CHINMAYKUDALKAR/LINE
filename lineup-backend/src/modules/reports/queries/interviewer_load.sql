SELECT
    u.id as "interviewerId",
    u.name as "interviewerName",
    COUNT(*)::int as "totalInterviews",
    COUNT(CASE WHEN i.date >= date_trunc('week', current_date) THEN 1 END)::int as "thisWeek",
    COUNT(CASE WHEN i.date >= date_trunc('month', current_date) THEN 1 END)::int as "thisMonth",
    COUNT(CASE WHEN i."hasFeedback" = false AND i.status = 'completed' THEN 1 END)::int as "pendingFeedback"
FROM "Interview" i, UNNEST(i."interviewerIds") as vid
JOIN "User" u ON u.id = vid
JOIN "Candidate" c ON c.id = i."candidateId"
WHERE i."tenantId" = $1 AND i."deletedAt" IS NULL AND c."deletedAt" IS NULL
GROUP BY u.id, u.name
ORDER BY "totalInterviews" DESC;
