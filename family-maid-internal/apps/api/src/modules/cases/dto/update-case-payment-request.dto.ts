// update-case-payment-request.dto — DTO cho PATCH /cases/:id/payment

import { IsEnum, IsOptional, IsString } from 'class-validator';

enum PaymentStatus {
  UNPAID = 'UNPAID',
  DEPOSIT_PAID = 'DEPOSIT_PAID',
  PAID = 'PAID',
}

export class UpdateCasePaymentRequestDto {
  @IsEnum(PaymentStatus)
  paymentStatus!: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentNote?: string;
}
