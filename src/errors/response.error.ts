import { ErrorResponse } from "src/models/responses/error.response";

export class ResponseError extends Error {
  public errorResponse: ErrorResponse;
  
  constructor(errorResponse: ErrorResponse) {
    super();
    this.errorResponse = errorResponse;
  }
}