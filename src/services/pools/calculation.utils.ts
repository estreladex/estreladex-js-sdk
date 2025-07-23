/* eslint-disable sort-exports/sort-exports */
import {
  AmountToBeDeposited,
  AmountToBeDepositedParams,
  AmountToBeWithdrawn,
  AmountToBeWithdrawnParams,
  AmountToSend,
  AmountToSendParams,
  LiquidityPoolExtended,
  LiquidityPoolSnapshot,
} from '../../models';
import { convertAmountPrecision, convertFloatAmountToInt, convertIntAmountToFloat } from '../utils/calculations';
import { FINANCIAL_POOL_PRECISION } from '../utils/constants';
import { AmountToBeReceived, AmountToBeReceivedParams } from './models';

const BP = 10000n;
const A = 20n;

export function calculateAmountToBeReceived(
  params: AmountToBeReceivedParams,
  pool: LiquidityPoolExtended & LiquidityPoolSnapshot,
): AmountToBeReceived {
  const N = pool.tokens.length;

  const amountInt = BigInt(convertFloatAmountToInt(params.amount, params.sourceToken.decimals).toFixed());

  const tokenFromIndex = pool.tokens.findIndex((t) => t.address === params.sourceToken.address);
  const tokenToIndex = pool.tokens.findIndex((t) => t.address === params.destToken.address);
  if (tokenFromIndex === -1 || tokenToIndex === -1) {
    throw new Error('Token not found in pool');
  }
  const balances = pool.tokenBalances.map((b) =>
    BigInt(convertFloatAmountToInt(b, FINANCIAL_POOL_PRECISION).toFixed()),
  );

  const d0 = BigInt(convertFloatAmountToInt(pool.totalLpAmount, FINANCIAL_POOL_PRECISION).toFixed());
  const inputSp = convertAmountPrecision(amountInt, params.sourceToken.decimals, FINANCIAL_POOL_PRECISION);
  const tokenFromNewBalance = balances[tokenFromIndex] + inputSp;

  let tokenToNewBalance: bigint;

  if (N === 2) {
    tokenToNewBalance = getYTwoPool([tokenFromNewBalance, d0], A);
  } else {
    const thirdIndex = getThirdTokenIndex(tokenFromIndex, tokenToIndex);
    tokenToNewBalance = getYThreePool([tokenFromNewBalance, balances[thirdIndex], d0], A);
  }

  let output = 0n;
  if (balances[tokenToIndex] > tokenToNewBalance) {
    const amountOutSystem = balances[tokenToIndex] - tokenToNewBalance;
    output = convertAmountPrecision(amountOutSystem, FINANCIAL_POOL_PRECISION, params.destToken.decimals);
  }

  const fee = (output * BigInt(pool.feeShareBp)) / BP;
  const receiveAmount = output - fee;

  return {
    receiveAmount: convertIntAmountToFloat(receiveAmount.toString(), params.destToken.decimals).toFixed(),
    fee: convertIntAmountToFloat(fee.toString(), params.destToken.decimals).toFixed(),
  };
}

export function calculateAmountToSend(
  params: AmountToSendParams,
  pool: LiquidityPoolExtended & LiquidityPoolSnapshot,
): AmountToSend {
  const N = pool.tokens.length;

  const outputInt = BigInt(convertFloatAmountToInt(params.expectedAmount, params.destToken.decimals).toFixed());

  const tokenFromIndex = pool.tokens.findIndex((t) => t.address === params.sourceToken.address);
  const tokenToIndex = pool.tokens.findIndex((t) => t.address === params.destToken.address);
  if (tokenFromIndex === -1 || tokenToIndex === -1) {
    throw new Error('Token not found in pool');
  }
  const balances = pool.tokenBalances.map((b) =>
    BigInt(convertFloatAmountToInt(b, FINANCIAL_POOL_PRECISION).toFixed()),
  );

  const d0 = BigInt(convertFloatAmountToInt(pool.totalLpAmount, FINANCIAL_POOL_PRECISION).toFixed());
  const feeShareBp = BigInt(pool.feeShareBp);
  const fee = (outputInt * feeShareBp) / (BP - feeShareBp);
  const outputWithFee = outputInt + fee;
  const outputSp = convertAmountPrecision(outputWithFee, params.destToken.decimals, FINANCIAL_POOL_PRECISION);

  const tokenToNewBalance = balances[tokenToIndex] - outputSp;

  let tokenFromNewBalance: bigint;

  if (N === 2) {
    tokenFromNewBalance = getYTwoPool([tokenToNewBalance, d0], A);
  } else {
    const thirdIndex = getThirdTokenIndex(tokenFromIndex, tokenToIndex);
    tokenFromNewBalance = getYThreePool([tokenToNewBalance, balances[thirdIndex], d0], A);
  }

  let input = 0n;
  if (balances[tokenFromIndex] < tokenFromNewBalance) {
    const amountInSystem = tokenFromNewBalance - balances[tokenFromIndex];
    input = convertAmountPrecision(amountInSystem, FINANCIAL_POOL_PRECISION, params.sourceToken.decimals);
  }

  return {
    amount: convertIntAmountToFloat(input, params.sourceToken.decimals).toFixed(),
    fee: convertIntAmountToFloat(fee.toString(), params.sourceToken.decimals).toFixed(),
  };
}

export function calculateAmountToBeDeposited(
  params: AmountToBeDepositedParams,
  pool: LiquidityPoolExtended & LiquidityPoolSnapshot,
): AmountToBeDeposited {
  const N = pool.tokens.length;

  const amountsSp = params.tokenAmounts.map((amount, index) =>
    convertAmountPrecision(
      BigInt(convertFloatAmountToInt(amount, pool.tokens[index].decimals).toFixed()),
      pool.tokens[index].decimals,
      FINANCIAL_POOL_PRECISION,
    ),
  );

  const d0 = BigInt(convertFloatAmountToInt(pool.totalLpAmount, FINANCIAL_POOL_PRECISION).toFixed());

  const balances = pool.tokenBalances.map((b) =>
    BigInt(convertFloatAmountToInt(b, FINANCIAL_POOL_PRECISION).toFixed()),
  );
  const newTokenBalancesSp = balances.map((balance, index) => balance + amountsSp[index]);

  let d1: bigint;
  if (N === 2) {
    d1 = getDTwoPool([newTokenBalancesSp[0], newTokenBalancesSp[1]], A);
  } else {
    d1 = getDThreePool([newTokenBalancesSp[0], newTokenBalancesSp[1], newTokenBalancesSp[2]], A);
  }

  const lpAmount = d1 - d0;

  return { lpAmount: convertIntAmountToFloat(lpAmount, FINANCIAL_POOL_PRECISION).toFixed() };
}

export function calculateAmountToBeWithdrawn(
  params: AmountToBeWithdrawnParams,
  pool: LiquidityPoolExtended & LiquidityPoolSnapshot,
): AmountToBeWithdrawn {
  const N = pool.tokens.length;
  const lpAmountInt = BigInt(convertFloatAmountToInt(params.lpAmount, FINANCIAL_POOL_PRECISION).toFixed());

  const d0 = BigInt(convertFloatAmountToInt(pool.totalLpAmount, FINANCIAL_POOL_PRECISION).toFixed());
  const d1 = d0 - lpAmountInt;

  const balances = pool.tokenBalances.map((b) =>
    BigInt(convertFloatAmountToInt(b, FINANCIAL_POOL_PRECISION).toFixed()),
  );

  const indexes = generateIndexes(balances);

  const tokenAmountsSp = balances.map((_, index) => (balances[indexes[index]] * lpAmountInt) / d0);

  const yArgs: bigint[] = new Array(N).fill(d1);
  if (N === 2) {
    yArgs[0] = balances[indexes[0]] - tokenAmountsSp[0];
  } else {
    yArgs[0] = balances[indexes[0]] - tokenAmountsSp[0];
    yArgs[1] = balances[indexes[2]] - tokenAmountsSp[2];
  }

  let y: bigint;
  if (pool.tokens.length === 2) {
    y = getYTwoPool([yArgs[0], yArgs[1]], A);
  } else {
    y = getYThreePool([yArgs[0], yArgs[1], yArgs[2]], A);
  }

  tokenAmountsSp[1] = balances[1] - y;

  const fees: bigint[] = [];
  const amounts: bigint[] = [];
  for (let i = 0; i < N; i++) {
    const index = indexes[i];
    let tokenAmountSp = tokenAmountsSp[i];
    const tokenAmount = convertAmountPrecision(tokenAmountSp, FINANCIAL_POOL_PRECISION, pool.tokens[index].decimals);
    const fee = (tokenAmount * BigInt(pool.feeShareBp)) / BP;

    tokenAmountSp = convertAmountPrecision(tokenAmount - fee, pool.tokens[index].decimals, FINANCIAL_POOL_PRECISION);

    fees[index] = fee;
    amounts[index] = tokenAmountSp;
  }

  return {
    tokenAmounts: amounts.map((amounts) => convertIntAmountToFloat(amounts, FINANCIAL_POOL_PRECISION).toFixed()),
    tokenFees: fees.map((fee, index) => convertIntAmountToFloat(fee, pool.tokens[index].decimals).toFixed()),
  };
}

// y = (sqrt(x(4Ad³ + x (4A(d - x) - d )²)) + x (4A(d - x) - d ))/8Ax
function getYTwoPool([x, d]: [bigint, bigint], a: bigint): bigint {
  const A4 = a << 2n;
  const ddd = d * d * d;

  // 4A(d - x) - d
  const part1 = A4 * (d - x) - d;
  // x * (4Ad³ + x(part1²))
  const part2 = x * (A4 * ddd + x * (part1 * part1));
  // (sqrt(part2) + x(part1))
  const sqrtSum = sqrt(part2) + x * part1;
  //8Ax
  const denominator = (a << 3n) * x;
  // (sqrtSum) / 8Ax)
  return sqrtSum / denominator;
}

function getYThreePool([x, z, d]: [bigint, bigint, bigint], a: bigint): bigint {
  const a27 = a * 27n;

  const b = x + z - d + d / a27;
  const c = d ** 4n / (-27n * a27 * x * z);

  const discriminant = b ** 2n - 4n * c;
  const absDiscriminant = discriminant < 0n ? -discriminant : discriminant;
  const sqrtDiscriminant = sqrt(absDiscriminant);

  const numerator = -b + sqrtDiscriminant;
  return numerator / 2n;
}

function getDTwoPool([x, y]: [bigint, bigint], a: bigint): bigint {
  const xy = x * y;

  // Axy(x+y)
  const p1 = a * xy * (x + y);

  // xy(4A - 1) / 3
  const p2 = (xy * ((a << 2n) - 1n)) / 3n;

  // sqrt(p1² + p2³)
  const p3 = sqrt(p1 * p1 + p2 * p2 * p2);

  // cbrt(p1 + p3) + cbrt(p1 - p3) or subtract if p3 > p1
  let d: bigint;
  if (p3 > p1) {
    d = cbrt(p1 + p3) - cbrt(p3 - p1);
  } else {
    d = cbrt(p1 + p3) + cbrt(p1 - p3);
  }

  return d << 1n;
}

function getDThreePool([x, y, z]: [bigint, bigint, bigint], a: bigint): bigint {
  let d = x + y + z;

  const denominator = 27n * x * y * z;
  const a27 = 27n * a;

  while (true) {
    const dPow4 = d ** 4n;
    const dPow3 = d ** 3n;

    const f = a27 * (x + y + z) - (a27 * d - d) - dPow4 / denominator;
    const df = (-4n * dPow3) / denominator - a27 + 1n;

    if (abs(f) < abs(df)) {
      break;
    }

    d -= f / df;
  }

  return d;
}

function abs(n: bigint): bigint {
  return n < 0n ? -n : n;
}

function sqrt(value: bigint): bigint {
  if (value < 0n) throw new Error('sqrt of negative bigint');
  if (value < 2n) return value;

  let x0 = value >> 1n;
  let x1 = (x0 + value / x0) >> 1n;

  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + value / x0) >> 1n;
  }

  return x0;
}

// Integer cube root using binary search
function cbrt(n: bigint): bigint {
  if (n < 0n) throw new Error('cbrt of negative bigint');
  if (n < 2n) return n;

  let low = 0n;
  let high = n;
  while (low <= high) {
    const mid = (low + high) >> 1n;
    const midCubed = mid * mid * mid;
    if (midCubed === n) return mid;
    if (midCubed < n) {
      low = mid + 1n;
    } else {
      high = mid - 1n;
    }
  }
  return high;
}

function generateIndexes(balances: bigint[]): number[] {
  const indices: number[] = Array.from({ length: balances.length }, (_, i) => i);

  for (let i = 0; i < indices.length; i++) {
    for (let j = 0; j < indices.length - 1 - i; j++) {
      const balanceA = balances[indices[j]];
      const balanceB = balances[indices[j + 1]];
      if (balanceA < balanceB) {
        [indices[j], indices[j + 1]] = [indices[j + 1], indices[j]];
      }
    }
  }

  return indices;
}

function getThirdTokenIndex(a: number, b: number): number {
  const indexes = [0, 1, 2];
  return indexes.find((i) => i !== a && i !== b)!;
}
