import { HttpStatus } from "src/models/responses/http-status.enum";

export class ErrorResponse {
	public statusCode: HttpStatus;
	public statusMessage: string;
	public unrecoverable: boolean;
}