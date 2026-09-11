import type { Payment, PaymentStatus } from '@cruz/types';

export interface InitiatePaymentParams {
  tripId: string;
  payerId: string;
  amountKes: number;
  phoneNumber?: string;
}

export interface PaymentProvider {
  initiatePayment(params: InitiatePaymentParams): Promise<Payment>;
  verifyPayment(paymentId: string): Promise<PaymentStatus>;
}

export class MockPaymentProvider implements PaymentProvider {
  private payments: Map<string, Payment> = new Map();

  async initiatePayment(params: InitiatePaymentParams): Promise<Payment> {
    const payment: Payment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      trip_id: params.tripId,
      payer_id: params.payerId,
      amount_kes: params.amountKes,
      provider: 'MOCK',
      provider_tx_id: `MOCK-TX-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'SUCCESS',
      created_at: new Date().toISOString(),
    };

    this.payments.set(payment.id, payment);
    return payment;
  }

  async verifyPayment(paymentId: string): Promise<PaymentStatus> {
    const p = this.payments.get(paymentId);
    return p ? p.status : 'FAILED';
  }
}
