#!/bin/bash

echo "🔓 Clearing rate limit data from Redis..."

# Connect to Redis and clear rate limit keys
docker exec lineup-redis redis-cli KEYS "ratelimit:*" | while read key; do
    if [ -n "$key" ]; then
        docker exec lineup-redis redis-cli DEL "$key" > /dev/null
        echo "   Cleared: $key"
    fi
done

# Also clear login attempt keys if they exist with different patterns
docker exec lineup-redis redis-cli KEYS "*login*" | while read key; do
    if [ -n "$key" ]; then
        docker exec lineup-redis redis-cli DEL "$key" > /dev/null
        echo "   Cleared: $key"
    fi
done

docker exec lineup-redis redis-cli KEYS "*attempt*" | while read key; do
    if [ -n "$key" ]; then
        docker exec lineup-redis redis-cli DEL "$key" > /dev/null
        echo "   Cleared: $key"
    fi
done

# Alternative: Clear ALL rate limit related keys with FLUSHDB (more aggressive)
# Uncomment below if the above doesn't work
# docker exec lineup-redis redis-cli FLUSHDB

echo ""
echo "🎉 Rate limits cleared! You can now login again."
