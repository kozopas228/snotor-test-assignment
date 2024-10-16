import customers from './data/customer-list.json';
import { processPayment } from './services/payment.processor';
import { ResponseError } from './errors/response.error';
import { Customer } from './models/customer.model';
import { PaymentMethod } from './models/payment-methods.model';
import { sendMessage } from './services/message.service';

(async function() {
	for (let i = 0; i < customers.length; i++) {
		const customer = customers[i] as Customer;
		
		try {
			await processPayment(customer);
			console.log('Successfully processed payment for customer', customer.id);
		} catch (err) {
			console.error('The payment failed to process:', err);

			if (err instanceof ResponseError) {
				const paymentMethods = customer.paymentMethods;
				let last4Digits = '';
				
				if (paymentMethods.defaultPaymentMethod === PaymentMethod.card) {
					last4Digits = paymentMethods.card.last4Digits;
				} else if (paymentMethods.defaultPaymentMethod === PaymentMethod.usBankAccount) {
					last4Digits = paymentMethods.usBankAccount.accountNumberLast4Digits;
				} else if (paymentMethods.defaultPaymentMethod == PaymentMethod.euBankAccount) {
					last4Digits = paymentMethods.euBankAccount.ibanLast4Digits;
				}
				
				await sendMessage(customer, last4Digits);
			}
		}
	}
})();