import BigNumber from 'bignumber.js';

export function convertAmountPrecision(amount: BigNumber.Value, decimalsFrom: number, decimalsTo: number): BigNumber {
  const dif = BigNumber(decimalsTo).minus(decimalsFrom).toNumber();
  return BigNumber(amount).times(toPowBase10(dif));
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

export function toPowBase10(decimals: number): BigNumber {
  return BigNumber(10).pow(decimals);
}
