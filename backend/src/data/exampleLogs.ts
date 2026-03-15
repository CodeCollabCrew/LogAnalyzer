export const exampleLogs = `
2024-01-15 08:00:02 [api-gateway] INFO Incoming request GET /orders
2024-01-15 08:00:02 [auth-service] INFO Validating JWT for user 123
2024-01-15 08:00:03 [db-service] ERROR Connection timeout after 5000ms
2024-01-15 08:00:03 [api-gateway] ERROR Failed to fetch /orders from db-service: Connection timeout after 5000ms
2024-01-15 08:00:04 [worker] WARN Retrying order aggregation job
2024-01-15 08:00:05 [cache-service] ERROR Redis pool exhausted while fetching session for user 123
2024-01-15 08:00:06 [auth-service] ERROR NullPointerException while reading user profile
2024-01-15 08:00:07 [db-service] CRITICAL Database is unreachable after 3 attempts
2024-01-15 08:00:08 [api-gateway] ERROR Circuit breaker opened for db-service
2024-01-15 08:00:10 [worker] INFO Job completed with partial failures
`;

