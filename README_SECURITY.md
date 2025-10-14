# Security Guidelines

## For Developers

### Authentication
- Never store passwords in plain text
- Always use bcrypt/scrypt for password hashing (handled by Supabase)
- Implement strong password requirements (min 8 chars, uppercase, lowercase, numbers)
- Use secure session management (done via Supabase Auth)

### Input Validation
- **Always validate user input** using Zod schemas
- **Always sanitize** before displaying or storing
- Use the sanitization utilities in `src/lib/sanitize.ts`
- Never trust client-side validation alone

### Database Security
- **Never disable RLS** on tables containing user data
- Use service role only for system operations
- Test RLS policies thoroughly
- Follow principle of least privilege

### API Security
- Require authentication for all sensitive endpoints
- Implement rate limiting
- Validate all input parameters
- Use idempotency keys for non-idempotent operations
- Never expose service role keys to frontend

### File Uploads
- Validate file type and size before upload
- Store files in secure buckets with proper RLS
- Scan files for malware in production
- Use Content-Type validation

### Secrets Management
- Never commit secrets to version control
- Use environment variables for configuration
- Store secrets in Lovable Cloud Secrets Manager
- Rotate secrets regularly

## For Security Auditors

### Testing Checklist
- [ ] Test RLS policies for each role
- [ ] Verify input validation on all forms
- [ ] Check for XSS vulnerabilities
- [ ] Test API rate limiting
- [ ] Verify authentication flows
- [ ] Check for SQL injection
- [ ] Test file upload restrictions
- [ ] Verify CORS configuration
- [ ] Check for exposed secrets
- [ ] Test authorization boundaries

### Known Security Measures
- Row Level Security (RLS) enabled on all tables
- Service role separation for system operations
- Input validation using Zod schemas
- HTML sanitization for XSS prevention
- API authentication and rate limiting
- Secure password requirements
- Role-based access control (RBAC)

### Security Contact
For security issues, please report to the project maintainers.
