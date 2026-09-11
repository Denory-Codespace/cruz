# Security Policy for Cruz

## Reporting Security Vulnerabilities
If you discover any security vulnerabilities or privacy concerns in the Cruz codebase, please report them directly to the founding engineering team:
- **Email**: `security@cruzmobility.com` (or contact founder Denzel)
- Please do not disclose vulnerabilities publicly or file public GitHub issues for sensitive security flaws.

## Security Baseline Principles
1. **Never commit secrets, service keys, or credentials**.
2. **PostgreSQL Row Level Security (RLS)** is enabled on all production/user data tables.
3. **Role-Based Access Control (RBAC)** is strictly enforced server-side.
4. **Financial Ledger Immutability**: Balances are calculated through append-only ledger entries; client-submitted amounts are NEVER trusted.
5. **Private Storage Buckets**: Identity and vehicle verification documents must be stored in private Supabase buckets accessed only via temporary signed URLs.
