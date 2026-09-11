# Cruz — Data Privacy & Compliance Overview

## 1. Data Collected
- **Passengers**: Name, email, phone number, trip origin/destination coordinates, ride history, payment receipts, ratings.
- **Drivers**: National ID, driver's license number, vehicle registration plate, location telemetry during online hours, earnings records.

## 2. Privacy Protections
- Passenger phone numbers and exact location data are shared only with the assigned driver for the duration of the active trip.
- Sensitive verification documents (National ID photos, insurance certificates) are stored in private Supabase Storage buckets, inaccessible without signed time-limited tokens granted strictly to authorized operations personnel.
- Historical trip coordinates are anonymized/aggregated for platform analytics.

## 3. Regulatory Disclaimer
Cruz is currently an engineering prototype and MVP. Prior to commercial launch in Kenya, formal compliance reviews regarding the Kenya Data Protection Act (2019) and National Transport and Safety Authority (NTSA) regulations will be conducted by Cruz legal counsel.
