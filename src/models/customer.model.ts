import { PaymentMethods } from "./payment-methods.model";

export class Customer {
	public id: number;
	public name: string;
	public email?: string;
	public mobile?: string;
	public mobileCarrier?: string;
	public paymentMethods: PaymentMethods;
}