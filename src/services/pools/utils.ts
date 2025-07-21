import { contract } from '@stellar/stellar-sdk';
import { LiquidityPool, LiquidityPoolProperties } from '../../models';
import { ThreePoolContract, ThreeToken } from '../models/generated/three-pool-contract';
import { TwoPoolContract } from '../models/generated/two-pool-contract';
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

export function getThreeToken(
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

export function transformLiquidityPoolPropertiesToLiquidityPool(pool: LiquidityPoolProperties): LiquidityPool {
  const { address, tokens } = pool;
  return {
    address,
    tokens,
  };
}
