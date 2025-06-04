import { FormOption } from "../models/form-question.model";

export const PAYMENT_TYPES = [
  { code: 'CC', name: 'Credit Card' },
  { code: 'ACH', name: 'ACH' },
];

export const PaymentTypesOptions: FormOption[] = PAYMENT_TYPES.map(item => ({
  label: item.name,
  value: item.code
}));
