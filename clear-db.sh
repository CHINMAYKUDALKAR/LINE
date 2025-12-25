#!/bin/bash

# Clear Database Script
# Clears all interviews, candidates, and related data

set -e

echo "🗑️  Clearing database..."

cd "$(dirname "$0")/lineup-backend"

# Clear all interview-related data and candidates
npx prisma db execute --schema=./prisma/schema.prisma --stdin <<EOF
-- Clear interviews and related data
DELETE FROM "Interview";
DELETE FROM "InterviewSlot";
DELETE FROM "BusyBlock" WHERE source = 'interview';

-- Clear candidates
DELETE FROM "Candidate";
EOF

echo "✅ Cleared:"
echo "   - All Interviews"
echo "   - All Interview Slots"  
echo "   - All Interview Busy Blocks"
echo "   - All Candidates"
echo ""
echo "🎉 Database cleared successfully!"
