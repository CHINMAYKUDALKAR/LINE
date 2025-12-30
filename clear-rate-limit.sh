#!/bin/bash

# Clear rate limit data from Redis
# Usage: ./clear-rate-limit.sh

echo "🔄 Clearing rate limit data from Redis..."

# Method 1: Try to delete specific keys
count=$(docker exec lineup-redis redis-cli KEYS "*rate*" 2>/dev/null | wc -l)
if [ "$count" -gt 0 ]; then
    docker exec lineup-redis redis-cli --scan --pattern "*rate*" | xargs -r docker exec -i lineup-redis redis-cli DEL 2>/dev/null
    echo "  Deleted $count rate limit keys"
fi

count=$(docker exec lineup-redis redis-cli KEYS "*throttle*" 2>/dev/null | wc -l)
if [ "$count" -gt 0 ]; then
    docker exec lineup-redis redis-cli --scan --pattern "*throttle*" | xargs -r docker exec -i lineup-redis redis-cli DEL 2>/dev/null
    echo "  Deleted $count throttle keys"
fi

count=$(docker exec lineup-redis redis-cli KEYS "*limit*" 2>/dev/null | wc -l)
if [ "$count" -gt 0 ]; then
    docker exec lineup-redis redis-cli --scan --pattern "*limit*" | xargs -r docker exec -i lineup-redis redis-cli DEL 2>/dev/null
    echo "  Deleted $count limit keys"
fi

# Method 2: If no specific keys found, just flush everything
total=$(docker exec lineup-redis redis-cli DBSIZE 2>/dev/null | awk '{print $2}')
if [ "$total" = "0" ] || [ -z "$total" ]; then
    echo "  No keys to clear (database already empty)"
else
    echo "  Flushing all ${total:-0} keys from Redis..."
    docker exec lineup-redis redis-cli FLUSHDB
fi

echo "✅ Rate limits cleared!"
