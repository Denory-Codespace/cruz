# Cruz — Driver Onboarding Workflow

## 1. Onboarding Pipeline

```mermaid
flowchart LR
    A[1. Sign Up Account] --> B[2. Personal Info & National ID]
    B --> C[3. Driving License Info]
    C --> D[4. Vehicle Details & Plate]
    D --> E[5. Document Uploads]
    E --> F[6. Admin Review Queue]
    F --> G{Approved?}
    G -- Yes --> H[7. Eligible & Can Go Online]
    G -- No --> I[Request Corrections]
```

## 2. Onboarding Requirements for MVP Pilot
- **Personal Details**: Full legal name, verified mobile phone number, email address.
- **Identification**: Kenyan National Identity Card (ID) number.
- **Driving Credentials**: Valid Kenyan Driving License number (minimum 2 years driving experience).
- **Vehicle Information**: Make, Model, Year of Manufacture (minimum 2013 for standard category), Color, License Plate Number.
- **Verification Documents**: Driver's license copy, vehicle registration/logbook copy, valid motor vehicle insurance certificate.
