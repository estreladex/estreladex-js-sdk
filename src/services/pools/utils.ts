import { contract } from '@stellar/stellar-sdk';
import { LiquidityPool } from '../../models';
import { ThreePoolContract, ThreeToken } from '../models/generated/three-pool-contract';
import { TwoPoolContract, TwoToken } from '../models/generated/two-pool-contract';
import ContractClientOptions = contract.ClientOptions;

export function getPoolContractType(
  tokens: number,
): new (args: ContractClientOptions) => TwoPoolContract | ThreePoolContract {
  if (tokens === 2) {
    return TwoPoolContract;
  } else {
    return ThreePoolContract;
  }
}

export function normalizeLiquidityPool<T extends LiquidityPool>(pool: T): LiquidityPool {
  const { address, tokens } = pool;
  return {
    address,
    tokens,
  };
}

export function resolveTokenPairThreePool(
  pool: LiquidityPool,
  sourceTokenAddress: string,
  destTokenAddress: string,
): {
  tokenFrom: ThreeToken;
  tokenTo: ThreeToken;
} {
  const tokenFrom: ThreeToken =
    pool.tokens[0].address === sourceTokenAddress
      ? ThreeToken.A
      : pool.tokens[1].address === sourceTokenAddress
        ? ThreeToken.B
        : ThreeToken.C;
  const tokenTo: ThreeToken =
    pool.tokens[0].address === destTokenAddress
      ? ThreeToken.A
      : pool.tokens[1].address === destTokenAddress
        ? ThreeToken.B
        : ThreeToken.C;

  return { tokenFrom, tokenTo };
}

export function resolveTokenPairTwoPool(
  pool: LiquidityPool,
  sourceTokenAddress: string,
  destTokenAddress: string,
): {
  tokenFrom: TwoToken;
  tokenTo: TwoToken;
} {
  const tokenFrom: TwoToken = pool.tokens[0].address === sourceTokenAddress ? TwoToken.A : TwoToken.B;
  const tokenTo: TwoToken = pool.tokens[0].address === destTokenAddress ? TwoToken.A : TwoToken.B;
  return { tokenFrom, tokenTo };
}
