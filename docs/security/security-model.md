# Cruz — Security Model

## 1. Authentication & Session Security
- Managed via Supabase Auth with secure HTTP-only cookies on Web and encrypted SecureStore on Mobile.
- Passwords are salted and hashed by Supabase Auth (bcrypt/argon2).
- Service Role Keys (`SUPABASE_SERVICE_ROLE_KEY`) are stored in server-side environment variables and NEVER exposed to frontend or mobile clients.

## 2. Row Level Security (RLS) Policy Matrix

| Table | PASSENGER | DRIVER | ADMIN / OPERATIONS |
| :--- | :--- | :--- | :--- |
| `user_profiles` | Read/Update Self | Read/Update Self | Read All / Update Status |
| `drivers` | Read Assigned Driver Public Info | Read/Update Self | Full Read/Write |
| `vehicles` | Read Assigned Driver Vehicle | Read/Update Own Vehicle | Full Read/Write |
| `ride_requests` | Read/Insert Self, Cancel Self | Read Assigned/Offered, Update Lifecycle | Full Read/Write |
| `trip_events` | Read Own Trip Events | Read Own Trip Events | Full Read |
| `driver_dispatches`| None | Read/Update Assigned Offers | Full Read |
| `payments` | Read Own Payments | Read Earnings Associated with Trip | Full Read |
| `wallets` | None | Read Own Wallet | Full Read |
| `wallet_transactions` | None | Read Own Ledger Rows | Full Read |
| `ratings` | Read/Insert For Own Trips | Read Received Ratings | Full Read |

## 3. Financial Integrity & Fraud Prevention
- Fares are calculated exclusively by the backend Fare Engine. Client requests cannot supply `fare_kes`.
- Payment state cannot be marked `SUCCESS` without server-side verification from the payment provider (or verified mock engine in development).
- Wallet transactions are strictly append-only and guarded by transactional database constraints.
