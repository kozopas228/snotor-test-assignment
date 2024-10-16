import { BankAccount } from "./bank-account.model";

export class UsBankAccount extends BankAccount {
	public accountType: string;
	public accountNumberLast4Digits: string;
}
