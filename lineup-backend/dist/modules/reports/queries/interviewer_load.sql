SELECT
    u.id as "interviewerId",
    u.name as "interviewerName",
    COUNT(*)::int as "totalInterviews",
    COUNT(CASE WHEN inter.date >= date_trunc('week', current_date) THEN 1 END)::int as "thisWeek",
    COUNT(CASE WHEN inter.date >= date_trunc('month', current_date) THEN 1 END)::int as "thisMonth",
    COUNT(CASE WHEN inter."hasFeedback" = false AND inter.status = 'completed' THEN 1 END)::int as "pendingFeedback"
FROM "Interview" inter
CROSS JOIN LATERAL UNNEST(inter."interviewerIds") AS vid
JOIN "User" u ON u.id = vid
JOIN "Candidate" c ON c.id = inter."candidateId"
WHERE inter."tenantId" = $1 AND inter."deletedAt" IS NULL AND c."deletedAt" IS NULL
GROUP BY u.id, u.name
ORDER BY "totalInterviews" DESC;
