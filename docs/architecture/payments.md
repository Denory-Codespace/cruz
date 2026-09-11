# Cruz — Payment & Financial Ledger Architecture

## 1. Zero-Cost Mock & M-Pesa Strategy
To avoid incurring third-party transaction fees or requiring active telecom merchant accounts during initial engineering:

1. **`PaymentProvider` Interface**:
   ```typescript
   export interface PaymentProvider {
     initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult>;
     verifyPayment(paymentId: string): Promise<PaymentStatus>;
     refundPayment(paymentId: string, amount: number): Promise<RefundResult>;
   }
   ```
2. **`MockPaymentProvider`**: Simulates instant or delayed STK Push payment confirmations locally.
3. **`MpesaPaymentProvider`**: Connects to Safaricom Daraja STK Push API when production keys are authorized.

## 2. Double-Entry Style Auditable Ledger
Balances are never stored as mutable scalar numbers. The `wallets` table maintains an indexed cache of balance, but all financial movements require a corresponding row in `wallet_transactions`:

- `TRIP_EARNING`: Driver credited (Gross Fare minus Commission).
- `PLATFORM_COMMISSION`: Platform revenue logged.
- `WITHDRAWAL`: Payout to driver mobile money account.
- `REFUND`: Credited back to passenger for disputed rides.

### Currency Precision
- All monetary amounts stored as integer minor units (`KES` integer units, e.g. KES 650 = `65000` cents or integer KES `650` with strict integer math).
