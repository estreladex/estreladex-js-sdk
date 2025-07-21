/* eslint-disable sort-exports/sort-exports */
export enum ErrorCode {
  SDK_ERROR = 'SdkError',
  INVALID_POOL_ADDRESS_ERROR = 'InvalidPoolAddressError',
  INVALID_AMOUNT_ERROR = 'InvalidAmountError',
  ARGUMENT_INVALID_DECIMALS_ERROR = 'ArgumentInvalidDecimalsError',
  API_FETCH_ERROR = 'ApiFetchError',
}

export abstract class SdkRootError extends Error {
  public errorCode: ErrorCode;

  protected constructor(code: ErrorCode, message?: string) {
    super(message);
    this.errorCode = code;
  }
}

export class SdkError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.SDK_ERROR, message);
  }
}

export class InvalidPoolAddressError extends SdkRootError {
  constructor(poolAddress: string) {
    super(ErrorCode.INVALID_POOL_ADDRESS_ERROR, `No Pool with poolAddress: '${poolAddress}'`);
  }
}

export class InvalidAmountError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.INVALID_AMOUNT_ERROR, message);
  }
}

export class ArgumentInvalidDecimalsError extends SdkRootError {
  constructor(argName: string, decimalsIs: number, decimalsRequired: number) {
    super(
      ErrorCode.ARGUMENT_INVALID_DECIMALS_ERROR,
      `Argument '${argName}' decimals '${decimalsIs}' cannot be greater than '${decimalsRequired}'`,
    );
  }
}

export class ApiFetchError extends SdkRootError {
  constructor(message?: string) {
    super(ErrorCode.API_FETCH_ERROR, message);
  }
}
