import { FormOption } from "../models/form-question.model";

export enum PaymentTypes {
  CreditCard,
  ACH,
}

export const PaymentTypesMap = new Map<PaymentTypes, string>([
  [PaymentTypes.CreditCard, 'Credit Card'],
  [PaymentTypes.ACH, 'ACH'],
]);

export const PaymentTypesOptions: FormOption[] = Array.from(PaymentTypesMap.entries()).map(
  ([key, value]) => ({
    label: value,
    value: key
  })
);
