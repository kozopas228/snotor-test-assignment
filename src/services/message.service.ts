import { traceparent } from 'tctx';
import { Customer } from '../models/customer.model';
import { Email } from '../models/email.model';
import { HttpStatus } from '../models/responses/http-status.enum';
import { ErrorResponse } from '../models/responses/error.response';
import { AT_AND_T_EMAIL, AT_AND_T_MOBILE_CARRIER } from '../constants/at_t.constants';
import { T_MOBILE_EMAIL, T_MOBILE_MOBILE_CARRIER } from '../constants/t-mobile.constants';
import { VERIZON_EMAIL } from '../constants/verizon.constants';
import { ResponseError } from '../errors/response.error';

const traceId = traceparent.make().toString();

export async function sendMessage(customer: Customer, accountNumberLast4: string) {
	const message = generateMessage(customer, accountNumberLast4);

	const emailPayload: Email = {
		from: process.env.PAYMENT_PROCESSING_EMAIL,
		to: [],
		messageBody: message
	}
	
	if (customer.email) {
		emailPayload.to = [customer.email];
	} else if (customer.mobile) {
		if (customer.mobileCarrier === AT_AND_T_MOBILE_CARRIER) {
			emailPayload.to.push(customer.mobile + AT_AND_T_EMAIL);
		} else if (customer.mobileCarrier === T_MOBILE_MOBILE_CARRIER) {
			emailPayload.to.push(customer.mobile + T_MOBILE_EMAIL);
		} else {
			emailPayload.to.push(customer.mobile + AT_AND_T_EMAIL);
			emailPayload.to.push(customer.mobile + T_MOBILE_EMAIL);
			emailPayload.to.push(customer.mobile + VERIZON_EMAIL);
		}
	}
	
	try {
		const response = await fetch(process.env.API_URL, {
			method: 'POST',
			headers: {
				Accept: 'application/json, */*',
				'Content-Type': 'application/json',
				Traceparent: traceId,
				Authorization: 'Bearer ' + process.env.API_KEY
			},
			body: JSON.stringify(emailPayload)
		});
	
		if (response.ok) {
			return await response.json();
		}
	
		throw new ResponseError(statusReject(response));
	} catch (err) {
		console.error('Error sending message to user');
		throw err;
	}
}

export function statusReject(res: Response): ErrorResponse {
	let statusText = null;
	
	switch (res.status) {
		case HttpStatus.BAD_REQUEST:
			statusText = res.statusText;
			break;
		case HttpStatus.UNAUTHORIZED:
			statusText = 'Authentication Error';
			break;
		case HttpStatus.FORBIDDEN:
			statusText = 'Authorization Error';
			break;
		case HttpStatus.NOT_FOUND:
			statusText = 'Not Found';
			break;
		case HttpStatus.CONFLICT:
			statusText = 'Conflict';
			break;
		default:
			statusText = 'Request Error';
			break;
	}
	
	const unrecoverable = res.status === HttpStatus.UNAUTHORIZED;
	return {
		statusCode: res.status,
		statusMessage: statusText,
		unrecoverable: unrecoverable
	}
}

function generateMessage(customer: Customer, accountNumberLast4: string) {
	if (customer.paymentMethods.card && customer.paymentMethods.card.last4Digits === accountNumberLast4) {
		return `Hello, ${customer.name},
		The scheduled payment for your electrical bill ending from your ${customer.paymentMethods.card.brand} credit card ending in ${customer.paymentMethods.card.last4Digits} failed.		
		Please verify your payment details and try again.`;
	} else if (customer.paymentMethods.euBankAccount !== undefined && customer.paymentMethods.euBankAccount.ibanLast4Digits == accountNumberLast4) {
		let euBank = customer.paymentMethods.euBankAccount;
		return `Hello, ${customer.name},
		The scheduled payment for your electrical bill ending from your ${euBank.bankName} bank in ${euBank.ibanLast4Digits} failed.		
		Please verify your payment details and try again.`;
	} else {
		let bankAccount = customer.paymentMethods.usBankAccount;
		return `Hello, ${customer.name},
		The scheduled payment for your electrical bill ending from your ${bankAccount.bankName} account ending in ${bankAccount.accountNumberLast4Digits} failed.		
		Please verify your payment details and try again.`;
	}
}