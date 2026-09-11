# Cruz — Database Relationships & ERD

## Entity Relationships

```mermaid
erDiagram
    AUTH_USERS ||--|| USER_PROFILES : "extends"
    USER_PROFILES ||--o| DRIVERS : "has operational profile"
    USER_PROFILES ||--o| WALLETS : "owns"
    DRIVERS ||--o{ VEHICLES : "registers"
    
    USER_PROFILES ||--o{ RIDE_REQUESTS : "requests (passenger)"
    DRIVERS ||--o{ RIDE_REQUESTS : "fulfills (driver)"
    
    RIDE_REQUESTS ||--o{ TRIP_EVENTS : "tracks state history"
    RIDE_REQUESTS ||--o{ DRIVER_DISPATCHES : "broadcasts offers"
    RIDE_REQUESTS ||--o| PAYMENTS : "generates"
    RIDE_REQUESTS ||--o{ RATINGS : "receives"
    
    WALLETS ||--o{ WALLET_TRANSACTIONS : "contains ledger entries"
    PAYMENTS ||--o{ WALLET_TRANSACTIONS : "triggers earnings & commission"
```

## Referential Integrity Rules
- Deletion of a user is soft (`is_active = false`) to maintain historical trip and financial ledger records.
- Deletion of trips is strictly prohibited. State transitions must move to `CANCELLED` with explicit reason.
- `wallet_transactions` are append-only. Adjustments or reversals are represented as new compensating transaction records.
