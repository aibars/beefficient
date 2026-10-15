# Beefficient Authentication — Deployment Checklist

This document provides the complete deployment checklist for bringing the BFC-AUTH1 authentication system to production. Follow these steps before any deployment.

## Pre-Deployment Phase

### 1. Secrets Management

**Environment Variables Required:**

All of these must be configured before deployment. Use your platform's secrets manager (e.g., AWS Secrets Manager, Heroku Config Vars, Kubernetes Secrets).

```bash
# JWT Secrets (MUST be at least 32 random characters)
AUTH_JWT_ACCESS_SECRET=<generate-random-32-char-secret>
AUTH_JWT_REFRESH_SECRET=<generate-random-32-char-secret>

# JWT Expiration Times (in seconds)
AUTH_JWT_ACCESS_EXPIRATION=900          # 15 minutes
AUTH_JWT_REFRESH_EXPIRATION=604800      # 7 days

# Bcrypt Configuration
AUTH_BCRYPT_ROUNDS=10                   # Rounds for password hashing

# Environment
NODE_ENV=production                     # Must be "production"

# Database
DATABASE_HOST=<your-postgres-host>
DATABASE_PORT=5432
DATABASE_USER=<your-db-user>
DATABASE_PASSWORD=<your-db-password>
DATABASE_NAME=beefficient_production

# Server Configuration
PORT=3000
```

**Secret Generation Instructions:**

For JWT secrets, generate cryptographically secure random strings:

```bash
# Using OpenSSL (Linux/macOS)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using pwgen
pwgen -s 32 1
```

**Secrets Validation Checklist:**

- [ ] `AUTH_JWT_ACCESS_SECRET` is at least 32 characters
- [ ] `AUTH_JWT_REFRESH_SECRET` is at least 32 characters
- [ ] Secrets are different from each other
- [ ] Secrets are not committed to version control
- [ ] Secrets are stored in platform secrets manager
- [ ] Secrets are not logged or exposed in error messages
- [ ] Backup of secrets exists in secure location (e.g., password manager)

---

### 2. HTTPS Configuration

**Production HTTPS is Mandatory.**

The refresh token cookie has `Secure` flag enabled in production, meaning it will only be sent over HTTPS.

**Checklist:**

- [ ] HTTPS is enabled on your domain
- [ ] SSL/TLS certificate is valid and not self-signed
- [ ] Certificate is not expired (check expiration date)
- [ ] Certificate issuer is trusted (not self-signed)
- [ ] `NODE_ENV=production` is set (enables Secure cookie flag)
- [ ] HSTS header is configured (optional but recommended):
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```
- [ ] HTTP traffic is redirected to HTTPS
- [ ] Mixed content (HTTP assets loaded on HTTPS page) is eliminated

**Certificate Renewal:**

- [ ] Set reminder for certificate renewal 30 days before expiration
- [ ] Monitor certificate expiration date
- [ ] Have automated renewal process in place (e.g., Let's Encrypt with certbot)

---

### 3. Database Preparation

**Database Schema and Migrations:**

The authentication system requires the users table. This was created in Task 1 migrations.

**Checklist:**

- [ ] PostgreSQL database is running and accessible
- [ ] Database version is 12.0 or later
- [ ] Database connection credentials are correct
- [ ] Run migrations: `npm run typeorm migration:run`
- [ ] Users table exists with proper schema:
  ```sql
  CREATE TABLE "users" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" varchar(255) NOT NULL UNIQUE,
    "passwordHash" varchar(255),
    "googleId" varchar(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  ```
- [ ] Indexes exist:
  - [ ] Unique index on `email`
  - [ ] Optional: Index on `googleId`
- [ ] Backup strategy is in place (see Backups section)

**Connection Pool Configuration:**

For production databases, configure connection pooling to prevent connection exhaustion:

```bash
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20
DATABASE_POOL_IDLE_TIMEOUT=30000
```

**Database Backup Checklist:**

- [ ] Daily automated backups are enabled
- [ ] Backup retention is at least 7 days
- [ ] Backups can be restored successfully (test restore)
- [ ] Backup encryption is enabled
- [ ] Backup location is separate from database

---

### 4. Testing

**Unit Tests:**

```bash
# Run all tests
npm test

# Expected output: All tests passing
# - AuthService tests: 23 passing
# - UsersService tests: 10 passing
# - JwtAuthGuard tests: 4 passing
# - Strategies tests: 8 passing
```

**Test Coverage Requirements:**

- [ ] Line coverage >= 80% on auth module
- [ ] Branch coverage >= 75%
- [ ] All critical paths tested:
  - [ ] Successful signup
  - [ ] Signup with duplicate email
  - [ ] Signup with weak password
  - [ ] Successful login
  - [ ] Login with invalid credentials
  - [ ] Login rate limiting
  - [ ] Refresh token rotation
  - [ ] Logout and cookie clearing

**Command:**

```bash
npm test -- --coverage auth
```

**E2E Tests:**

For end-to-end testing, set up a test database:

```bash
# Run E2E tests against test database
npm run test:e2e

# Tests to verify:
# - POST /auth/signup returns 201 with tokens
# - POST /auth/login returns 200 with tokens
# - POST /auth/refresh returns new tokens
# - POST /auth/logout clears cookie
# - Protected routes reject missing token
# - Rate limiting blocks >10 logins/5min
```

**Manual Testing Checklist:**

- [ ] Sign up with valid credentials → Returns 201, tokens, cookie
- [ ] Sign up with duplicate email → Returns 409 Conflict
- [ ] Sign up with weak password → Returns 400 Bad Request
- [ ] Login with correct credentials → Returns 200, tokens, cookie
- [ ] Login with wrong password → Returns 401 Unauthorized
- [ ] Make 11 login attempts within 5 minutes → 11th returns 429
- [ ] Refresh with valid token → Returns new accessToken
- [ ] Refresh with expired token → Returns 401 Unauthorized
- [ ] Access protected route with expired token → Returns 401
- [ ] Logout and verify cookie is cleared → Returns 200, cookie max-age=0

---

### 5. Monitoring and Logging

**Application Logging:**

Configure structured logging for production:

```bash
# Enable info-level logging
LOG_LEVEL=info

# Log format (example with Morgan middleware)
Morgan format: combined
Log auth events: signup, login, logout, refresh, rate-limit hits
```

**Logging Checklist:**

- [ ] Auth events are logged:
  - [ ] Successful signup (no password logged)
  - [ ] Failed signup attempts (validation errors, duplicate email)
  - [ ] Successful login
  - [ ] Failed login attempts (rate limiting)
  - [ ] Token refresh
  - [ ] Logout
- [ ] Passwords and secrets are never logged
- [ ] Log retention is configured (minimum 30 days)
- [ ] Logs are centralized (e.g., CloudWatch, Datadog, ELK stack)

**Metrics to Monitor:**

```
- requests_per_second (auth endpoints)
- signup_success_rate
- signup_failure_rate
- login_success_rate
- login_failure_rate (by reason: invalid credentials, rate limited)
- token_refresh_rate
- logout_rate
- error_rate (5xx responses)
- latency_p50, p95, p99
```

**Error Tracking:**

- [ ] Set up error tracking (e.g., Sentry, Rollbar)
- [ ] Auth-related errors are captured:
  - [ ] Password hashing errors
  - [ ] Database errors
  - [ ] JWT validation errors
  - [ ] Rate limiting errors

**Health Check:**

Create a health endpoint for monitoring:

```bash
GET /health
→ Returns { status: "ok", timestamp: "ISO-8601" }
```

```bash
GET /auth/health
→ Returns { status: "ok", jwt: "ok", database: "ok" }
```

**Alerting Checklist:**

- [ ] Alert on error rate > 5% for 5 minutes
- [ ] Alert on signup failure rate > 20%
- [ ] Alert on database connection errors
- [ ] Alert on JWT validation errors > 100/min
- [ ] Alert on rate limiting > 1000/hour
- [ ] Alert on latency p95 > 1000ms

---

### 6. Security Hardening

**CORS Configuration:**

```typescript
// In app.module.ts
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,  // Required for cookies
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400,  // 24 hours
};
```

**CORS Checklist:**

- [ ] `ALLOWED_ORIGINS` environment variable is set
- [ ] Only whitelisted origins are allowed
- [ ] `credentials: true` is set (for cookies)
- [ ] Unnecessary methods are not exposed (no PUT, DELETE, PATCH)
- [ ] Test CORS with curl from different origin

**Rate Limiting Configuration:**

Current limits (in src/auth/auth.controller.ts):
- Login: 10 attempts per 300 seconds (5 minutes)

**Rate Limiting Checklist:**

- [ ] Rate limits are appropriate for expected load
- [ ] Rate limiter uses memory or distributed cache (not in-memory only)
- [ ] Rate limits are per IP address or per user (configurable)
- [ ] Rate limit headers are included in responses:
  ```
  X-RateLimit-Limit: 10
  X-RateLimit-Remaining: 9
  X-RateLimit-Reset: 1696776300
  ```

**API Security Headers:**

Add these headers to all responses:

```
X-Content-Type-Options: nosniff          # Prevent MIME type sniffing
X-Frame-Options: DENY                    # Prevent clickjacking
X-XSS-Protection: 1; mode=block          # XSS protection
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

**Security Headers Checklist:**

- [ ] X-Content-Type-Options header is set
- [ ] X-Frame-Options header is set
- [ ] X-XSS-Protection header is set
- [ ] Content-Security-Policy header is configured
- [ ] Referrer-Policy header is set
- [ ] Test headers with: curl -I https://your-domain.com/health

---

### 7. Deployment Execution

**Pre-Deployment Checklist:**

- [ ] All tests pass locally
- [ ] Code is committed to version control
- [ ] PR review is approved (if required by process)
- [ ] Environment variables are configured
- [ ] HTTPS certificate is valid
- [ ] Database backups are current
- [ ] Health monitoring is set up
- [ ] Rollback plan is documented

**Deployment Steps:**

1. **Deploy to Staging First:**
   ```bash
   # Deploy to staging environment
   npm run build
   npm run deploy:staging
   ```

2. **Run Smoke Tests:**
   ```bash
   # Test basic auth flow in staging
   npm run test:smoke:staging
   ```

3. **Deploy to Production:**
   ```bash
   npm run deploy:production
   ```

4. **Post-Deployment Verification:**
   ```bash
   # Verify endpoints are responding
   curl https://your-domain.com/auth/signup -X POST \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "TestPassword123"}'
   
   # Should return 400 (missing password validation) or 409 (email exists)
   ```

**Deployment Checklist:**

- [ ] Build succeeds without errors
- [ ] Docker image is built (if using Docker)
- [ ] Image is pushed to registry
- [ ] Health checks pass
- [ ] Metrics are being collected
- [ ] Logs are being aggregated
- [ ] Alerts are firing correctly
- [ ] Team is notified of deployment

---

### 8. Post-Deployment Validation

**Immediate Checks (First 15 minutes):**

- [ ] Application is running (health check returns 200)
- [ ] No errors in logs (check error rate)
- [ ] Database connections are working
- [ ] Auth endpoints are responding
- [ ] Rate limiting is working
- [ ] Monitoring dashboards show normal traffic

**Validation Steps:**

```bash
# 1. Check health
curl https://your-domain.com/health

# 2. Test signup flow
RESPONSE=$(curl -X POST https://your-domain.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPassword123"}')

# Verify response has accessToken and refreshToken
echo $RESPONSE | jq '.accessToken' | grep -q 'eyJ' && echo "✓ Signup working"

# 3. Test rate limiting
for i in {1..11}; do
  curl -X POST https://your-domain.com/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrong"}'
  sleep 0.5
done
# 11th request should return 429

# 4. Check database
# Connect to production database and verify users table is populated
psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME \
  -c "SELECT COUNT(*) FROM users;"
```

**Post-Deployment Checklist:**

- [ ] Health endpoint returns 200
- [ ] Error logs show no critical errors
- [ ] Auth events are logged
- [ ] Signup creates users in database
- [ ] Login increments lastLoginAt
- [ ] Rate limiting blocks after 10 attempts
- [ ] Tokens are being set in cookies
- [ ] Token refresh is working
- [ ] Logout clears cookies

---

## Ongoing Operations

### 1. Regular Monitoring

**Daily:**
- [ ] Check application error rate (should be < 1%)
- [ ] Check for failed deployments
- [ ] Review auth-related error logs

**Weekly:**
- [ ] Review login/signup metrics
- [ ] Check database size growth
- [ ] Verify backups are completing

**Monthly:**
- [ ] Review security logs for suspicious activity
- [ ] Audit access to secrets
- [ ] Plan for upcoming certificate renewal (if not automated)

### 2. Backup and Recovery

**Backup Schedule:**
- Full backup daily at 2 AM
- Incremental backups every 6 hours
- Retention: 7 days

**Backup Verification:**
- [ ] Test restore weekly from backup
- [ ] Document recovery time objective (RTO): < 1 hour
- [ ] Document recovery point objective (RPO): < 6 hours
- [ ] Store backup encryption keys separately from backups

**Disaster Recovery Plan:**
- [ ] Document how to restore from backup
- [ ] Test recovery process monthly
- [ ] Keep runbook in shared location (not just in someone's head)

### 3. Log Rotation

**Application Logs:**
- Rotate logs daily
- Compress logs older than 7 days
- Archive logs older than 30 days

**Database Logs:**
- Monitor PostgreSQL slow query log
- Alert on queries taking > 1 second
- Analyze slow queries monthly

### 4. Secrets Rotation

**JWT Secrets:**
- [ ] Plan rotation strategy (blue-green deployment with key versioning)
- [ ] Rotate JWT secrets annually
- [ ] Test secret rotation process before implementing

**Database Password:**
- [ ] Rotate database password quarterly
- [ ] Coordinate rotation with deployment to avoid downtime

---

## Rollback Plan

If critical issues are discovered post-deployment:

**Immediate Actions:**
1. Enable rate limiting on auth endpoints to prevent abuse
2. Monitor error logs for specific error patterns
3. Alert team on critical issues

**For Recoverable Issues:**
1. Fix issue in code
2. Deploy hotfix to production
3. Run smoke tests again

**For Unrecoverable Issues (Rollback):**
1. Revert to previous deployment:
   ```bash
   npm run deploy:rollback
   ```
2. Verify health checks pass
3. Verify database is accessible
4. Notify team and stakeholders

**Post-Rollback:**
- Investigate root cause
- Fix issue
- Add regression test
- Re-plan deployment

---

## Compliance and Auditing

### Password Security

- [ ] Passwords are hashed with bcrypt (not plain text)
- [ ] Passwords are never logged
- [ ] Passwords are never exposed in error messages
- [ ] Password reset functionality (future) uses secure tokens

### Token Security

- [ ] Tokens are signed with HS256
- [ ] Token secrets are rotated annually
- [ ] Expired tokens are rejected
- [ ] Token version rotation prevents reuse

### Data Protection

- [ ] User data is encrypted in transit (HTTPS)
- [ ] User passwords are hashed (bcrypt)
- [ ] Database backups are encrypted
- [ ] Access to production database is restricted
- [ ] PII is not logged or exposed

### Audit Trail

- [ ] All auth events are logged:
  - [ ] User signup (timestamp, email, IP address)
  - [ ] User login (timestamp, email, IP address)
  - [ ] User logout (timestamp, user ID)
  - [ ] Failed login attempts (timestamp, email, IP address, reason)
  - [ ] Rate limiting events (timestamp, IP address, endpoint)

### GDPR Compliance (if applicable)

- [ ] User can request data export
- [ ] User can delete account (soft delete recommended)
- [ ] User consent is recorded for data collection
- [ ] Data retention policy is documented (delete users after 2 years inactivity?)

---

## Troubleshooting Common Issues

### Issue: "Invalid JWT secret" Error

**Cause:** JWT secret in environment doesn't match the one used to create tokens

**Solution:**
1. Verify `AUTH_JWT_ACCESS_SECRET` and `AUTH_JWT_REFRESH_SECRET` are correct
2. If secrets were rotated, old tokens will not validate (expected behavior)
3. Users will need to login again to get new tokens

### Issue: Cookies Not Being Set

**Cause:** Browser is blocking cookies (common issues: HTTPS not configured, SameSite=Strict too strict)

**Solution:**
1. Verify HTTPS is enabled (Secure flag requires HTTPS)
2. Verify `NODE_ENV=production` is set
3. Check browser console for cookie warnings
4. Verify domain in cookie matches request domain

### Issue: Rate Limiting Not Working

**Cause:** Rate limiting middleware not configured or memory-based storage doesn't scale

**Solution:**
1. Verify `@Throttle` decorator is on endpoint
2. Check `ThrottlerModule` is imported in auth.module.ts
3. Consider using Redis for distributed rate limiting (if horizontally scaled)

### Issue: Database Connection Errors

**Cause:** Connection pool exhausted, network issues, or credentials wrong

**Solution:**
1. Check database connection string: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
2. Verify database server is running
3. Increase connection pool size: `DATABASE_POOL_MAX=30`
4. Check network connectivity to database server

### Issue: High Latency on Auth Endpoints

**Cause:** Bcrypt hashing is slow (intentionally), database is slow, or network issues

**Solution:**
1. Check bcrypt rounds (`AUTH_BCRYPT_ROUNDS`). Default 10 is ~100ms. Normal.
2. Monitor database query latency
3. Check application server CPU and memory usage
4. Consider caching user lookups (for password validation)

---

## Support and Escalation

**For Auth-Related Issues, Check:**
1. Application logs: `LOG_LEVEL=debug npm run start`
2. Database connection: `psql -h $HOST -U $USER -d $DB -c "SELECT 1"`
3. Environment variables: `printenv | grep AUTH_`
4. Network connectivity: `curl -I https://your-domain.com`

**Escalation Path:**
1. Try to reproduce issue in staging
2. Check logs and metrics
3. Review recent deployments
4. Consult implementation plan (docs/superpowers/plans/)
5. Open an issue on the project tracker (Linear)

---

## Appendix: Environment Variables Reference

```bash
# ====== Auth Configuration ======
AUTH_JWT_ACCESS_SECRET=<random-32-char-string>
AUTH_JWT_REFRESH_SECRET=<random-32-char-string>
AUTH_JWT_ACCESS_EXPIRATION=900
AUTH_JWT_REFRESH_EXPIRATION=604800
AUTH_BCRYPT_ROUNDS=10

# ====== Database ======
DATABASE_HOST=<postgres-hostname>
DATABASE_PORT=5432
DATABASE_USER=<postgres-user>
DATABASE_PASSWORD=<postgres-password>
DATABASE_NAME=beefficient_production
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# ====== Server ======
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# ====== CORS ======
ALLOWED_ORIGINS=https://beefficient.com,https://app.beefficient.com

# ====== Monitoring ======
SENTRY_DSN=<optional-sentry-url>
NEW_RELIC_LICENSE_KEY=<optional-newrelic-key>
```

---

## See Also

- [Authentication API Documentation](https://github.com/aibars/beefficient-workspace/blob/main/docs/AUTH.md) (workspace)
- [Implementation Plan](docs/superpowers/plans/2026-10-08-bfc-auth1-implementation.md)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
