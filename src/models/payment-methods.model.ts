import { EuBankAccount } from "./banks-payments/eu-bank-account.model";
import { UsBankAccount } from "./banks-payments/us-bank-account.model";
import { Card } from "./card.model";

export class PaymentMethods {
	card: Card;
	usBankAccount: UsBankAccount;
	euBankAccount: EuBankAccount;
	defaultPaymentMethod: PaymentMethod;
}

export enum PaymentMethod {
  card = 'card',
  usBankAccount = 'usBankAccount',
  euBankAccount = 'euBankAccount'
}