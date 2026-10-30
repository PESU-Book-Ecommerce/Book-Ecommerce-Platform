
# Sprint 2 Performance and Quality Report

## NFR-01 — Performance

- Test endpoint: GET /api/books
- Test type: Sequential HTTP latency test
- Number of requests: 50
- Successful requests: 50
- Failed requests: 0
- Average response time: 64.01 ms
- 95th percentile (P95): 271.42 ms
- Test environment: Local development machine

### Result
All 50 requests completed successfully with zero failures.

This is a basic sequential performance test and does not establish concurrent-user scalability.

## NFR-04 — Software Quality

### Implemented Practices
- Modular Express routes
- Reusable authentication middleware
- JWT authentication
- Role-based authorization
- Password hashing using bcryptjs
- Input validation
- HTTP status code handling

### Testing Results

| Test | Result |
|---|---|
| Health endpoint test | PASS |
| Unknown endpoint test | PASS |
| Customer registration and login | PASS |
| Seller registration and login | PASS |
| Customer order history | PASS |
| Seller order management | PASS |
| Unauthorized customer access | PASS |
| Missing JWT token rejection | PASS |

### Automated Testing
- Testing framework: Node.js built-in test runner
- HTTP testing library: Supertest
- Total automated tests: 2
- Passed: 2
- Failed: 0

### Known Limitations
- Automated Supertest cases currently use an isolated Express application.
- Full integration testing with MongoDB is still required.
- Performance testing uses sequential requests, not concurrent load.
- Production scalability has not been established.
