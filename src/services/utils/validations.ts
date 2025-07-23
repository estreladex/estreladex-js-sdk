import BigNumber from 'bignumber.js';
import { ArgumentInvalidDecimalsError, InvalidAmountError } from '../../exceptions';

export function validateAmountDecimals(argName: string, amountFloat: BigNumber.Value, decimalRequired: number) {
  const amount = BigNumber(amountFloat).toFixed();
  if (amount.split('.').length === 2 && amount.split('.')[1].length > decimalRequired) {
    throw new ArgumentInvalidDecimalsError(argName, amount.split('.')[1].length, decimalRequired);
  }
}

export function validateAmountGteZero(argName: string, amount: BigNumber.Value) {
  if (BigNumber(amount).isNaN() || BigNumber(amount).lt(0)) {
    throw new InvalidAmountError(`${argName} amount must be greater or equal than zero`);
  }
}

export function validateAmountGtZero(argName: string, amount: BigNumber.Value) {
  if (BigNumber(amount).isNaN() || BigNumber(amount).lte(0)) {
    throw new InvalidAmountError(`${argName} amount must be greater than zero`);
  }
}

export function validateArraysSameLength(argNameA: string, argNameB: string, arrA: unknown[], arrB: unknown[]) {
  if (arrA.length !== arrB.length) {
    throw new InvalidAmountError(
      `${argNameA} and ${argNameB} must have the same length (got ${arrA.length} and ${arrB.length})`,
    );
  }
}
