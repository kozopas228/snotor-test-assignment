import { BankAccount } from "./bank-account.model";

export class EuBankAccount extends BankAccount {
	public countryCode: string;
	public ibanLast4Digits: string;
}