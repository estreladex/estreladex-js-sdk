import BigNumber from 'bignumber.js';

export function convertAmountPrecision(amount: bigint, decimalsFrom: number, decimalsTo: number): bigint;
export function convertAmountPrecision(amount: BigNumber.Value, decimalsFrom: number, decimalsTo: number): BigNumber;
export function convertAmountPrecision(
  amount: bigint | BigNumber.Value,
  decimalsFrom: number,
  decimalsTo: number,
): bigint | BigNumber {
  const dif = decimalsTo - decimalsFrom;
  if (typeof amount === 'bigint') {
    const factor = 10n ** BigInt(Math.abs(dif));
    return dif >= 0 ? amount * factor : amount / factor;
  } else {
    const bnAmount = new BigNumber(amount);
    const factor = new BigNumber(10).pow(Math.abs(dif));
    return dif >= 0 ? bnAmount.times(factor) : bnAmount.div(factor);
  }
}

export function convertFloatAmountToInt(amountFloat: BigNumber.Value, decimals: number): BigNumber {
  return BigNumber(amountFloat).times(toPowBase10(decimals));
}

export function convertIntAmountToFloat(amountInt: BigNumber.Value, decimals: number): BigNumber {
  const amountValue = BigNumber(amountInt);
  if (amountValue.eq(0)) {
    return BigNumber(0);
  }
  return BigNumber(amountValue).div(toPowBase10(decimals));
}

function toPowBase10(decimals: number): BigNumber {
  return BigNumber(10).pow(decimals);
}
