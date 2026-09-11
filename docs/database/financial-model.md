# Cruz — Financial Model & Fare Structure

## 1. Fare Calculation Formula
Cruz uses a transparent, deterministic fare engine for standard rides in Kenya (KES):

$$\text{Fare} = \max(\text{Base Fare} + (\text{Distance (km)} \times \text{Per Km Rate}) + (\text{Duration (mins)} \times \text{Per Minute Rate}), \text{Minimum Fare})$$

### MVP Default Parameters (Nairobi, Kenya)
- **Base Fare**: KES 150
- **Per Kilometer Rate**: KES 35
- **Per Minute Rate**: KES 5
- **Minimum Fare**: KES 200
- **Platform Commission**: 15%

### Example Calculation
- A 6.5 km trip taking 18 minutes:
  - Base: KES 150
  - Distance: $6.5 \times 35 = 227.5$
  - Time: $18 \times 5 = 90$
  - Gross Fare = $150 + 227.5 + 90 = 467.5 \rightarrow \mathbf{468 \text{ KES}}$ (rounded to nearest integer)
  - Platform Commission (15%) = $\mathbf{70 \text{ KES}}$
  - Driver Net Earning (85%) = $\mathbf{398 \text{ KES}}$

## 2. Ledger Transaction Execution
When a trip completes and payment succeeds:
1. `payments` record marked `SUCCESS` for KES 468.
2. `wallet_transactions` row created:
   - `type`: `TRIP_EARNING`
   - `amount_kes`: `+398`
   - `wallet_id`: Driver's wallet ID
   - `reference_id`: `trip_id`
3. `wallet_transactions` row created for platform account:
   - `type`: `PLATFORM_COMMISSION`
   - `amount_kes`: `+70`
   - `reference_id`: `trip_id`
4. Driver wallet balance atomically updated to reflect ledger sum.
