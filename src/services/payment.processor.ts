import { statusReject } from './message.service';
import { traceparent } from 'tctx';
import { Customer } from '../models/customer.model';
import { ResponseError } from '../errors/response.error';
import { getRandomInteger } from '../utils/math';

const traceId = traceparent.make().toString();


export async function processPayment(customer: Customer): Promise<any> {
	try {
		const response = await fetch(process.env.STIPE_PAYMENT_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Traceparent: traceId,
				Authorization: 'Bearer ' + process.env.STRIPE_API_KEY
			},
			body: JSON.stringify({
				customerId: customer.id,
				paymentMethod: customer.paymentMethods[customer.paymentMethods.defaultPaymentMethod],
				amount: getCustomerPaymentAmount(customer.id)
			})
		});
	
		const responseJson = await response.json();
	
		if (response.ok) {
			return responseJson;
		}
	
		throw new ResponseError(statusReject(response));
	} catch (err) {
		console.error('Error calling Stripe payment API:', err);
		throw err;
	}
}

function getCustomerPaymentAmount(customerId: number) {
	const integerPart = getRandomInteger(50, customerId);
  const decimalPart = Math.random();
  const amount = integerPart + decimalPart; 
  return amount.toFixed(2);
}