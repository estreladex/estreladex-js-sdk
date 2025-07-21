import BigNumber from 'bignumber.js';
import {
  ClaimRewardsParams,
  DepositParams,
  FINANCIAL_POOL_PRECISION,
  RpcOptions,
  SwapParams,
  WithdrawParams,
} from '../../index';
import { ThreePoolContract } from '../models/generated/three-pool-contract';
import { TwoPoolContract, TwoToken } from '../models/generated/two-pool-contract';
import { convertFloatAmountToInt } from '../utils/calculations';
import { getContract } from '../utils/utils';
import { validateAmountDecimals, validateAmountGteZero, validateAmountGtZero } from '../utils/validations';
import { PoolService } from './pool-service';
import { getPoolContractType, getThreeToken } from './utils';

export interface PoolTxBuilder {
  /**
   * Returns XDR Swap transaction
   * @param params
   */
  buildSwapTxXdr(params: SwapParams): Promise<string>;

  /**
   * Returns XDR Deposit transaction
   * @param params
   */
  buildDepositTxXdr(params: DepositParams): Promise<string>;

  /**
   * Returns XDR Withdraw transaction
   * @param params
   */
  buildWithdrawTxXdr(params: WithdrawParams): Promise<string>;

  /**
   * Returns XDR ClaimRewards transaction
   * @param params
   */
  buildClaimRewardsTxXdr(params: ClaimRewardsParams): Promise<string>;
}

export class PoolTxBuilderService implements PoolTxBuilder {
  constructor(
    private rpcOptions: RpcOptions,
    private poolService: PoolService,
  ) {}

  async buildSwapTxXdr(params: SwapParams): Promise<string> {
    const pool = this.poolService.getPool(params.poolAddress);
    validateAmountGtZero('amount', params.amount);
    validateAmountDecimals('amount', params.amount, params.sourceToken.decimals);

    if (pool.tokens.length === 2) {
      const poolContract = getContract(TwoPoolContract, pool.address, this.rpcOptions, params.sender);
      const tokenFrom: TwoToken = pool.tokens[0].address === params.sourceToken.address ? TwoToken.A : TwoToken.B;
      const tokenTo: TwoToken = pool.tokens[0].address === params.destToken.address ? TwoToken.A : TwoToken.B;
      return (
        await poolContract.swap({
          sender: params.sender,
          recipient: params.recipient,
          amount_in: BigInt(convertFloatAmountToInt(params.amount, params.sourceToken.decimals).toFixed()),
          receive_amount_min: BigInt(
            convertFloatAmountToInt(params.receiveAmountMin, params.destToken.decimals).toFixed(),
          ),
          token_from: tokenFrom,
          token_to: tokenTo,
        })
      ).toXDR();
    } else {
      const poolContract = getContract(ThreePoolContract, pool.address, this.rpcOptions, params.sender);
      const { tokenFrom, tokenTo } = getThreeToken(pool, params.sourceToken.address, params.destToken.address);
      return (
        await poolContract.swap({
          sender: params.sender,
          recipient: params.recipient,
          amount_in: BigInt(convertFloatAmountToInt(params.amount, params.sourceToken.decimals).toFixed()),
          receive_amount_min: BigInt(
            convertFloatAmountToInt(params.receiveAmountMin, params.destToken.decimals).toFixed(),
          ),
          token_from: tokenFrom,
          token_to: tokenTo,
        })
      ).toXDR();
    }
  }

  async buildDepositTxXdr(params: DepositParams): Promise<string> {
    const pool = this.poolService.getPool(params.poolAddress);
    params.tokenAmounts.map((amount, index) => validateAmountGteZero(`tokenAmounts[${index}]`, amount));
    validateAmountGtZero(
      'sum of tokenAmounts',
      params.tokenAmounts.reduce((acc, current) => {
        return acc.plus(current);
      }, BigNumber(0)),
    );
    params.tokenAmounts.map((amount, index) =>
      validateAmountDecimals(`tokenAmounts[${index}]`, amount, pool.tokens[index].decimals),
    );

    const poolContract = getContract(
      getPoolContractType(pool.tokens.length),
      pool.address,
      this.rpcOptions,
      params.sender,
    );
    const amountInts = params.tokenAmounts.map((amount, index) =>
      BigInt(convertFloatAmountToInt(amount, pool.tokens[index].decimals).toFixed()),
    );
    return (
      await poolContract.deposit({
        sender: params.sender,
        amounts: amountInts,
        min_lp_amount: BigInt(convertFloatAmountToInt(params.minLpAmount, FINANCIAL_POOL_PRECISION).toFixed()),
      })
    ).toXDR();
  }

  async buildWithdrawTxXdr(params: WithdrawParams): Promise<string> {
    const pool = this.poolService.getPool(params.poolAddress);
    validateAmountGtZero('lpAmount', params.lpAmount);
    validateAmountDecimals('lpAmount', params.lpAmount, FINANCIAL_POOL_PRECISION);
    const poolContract = getContract(
      getPoolContractType(pool.tokens.length),
      pool.address,
      this.rpcOptions,
      params.sender,
    );
    return (
      await poolContract.withdraw({
        sender: params.sender,
        lp_amount: BigInt(convertFloatAmountToInt(params.lpAmount, FINANCIAL_POOL_PRECISION).toFixed()),
      })
    ).toXDR();
  }

  async buildClaimRewardsTxXdr(params: ClaimRewardsParams): Promise<string> {
    const pool = this.poolService.getPool(params.poolAddress);
    const poolContract = getContract(
      getPoolContractType(pool.tokens.length),
      pool.address,
      this.rpcOptions,
      params.sender,
    );
    return (
      await poolContract.claim_rewards({
        sender: params.sender,
      })
    ).toXDR();
  }
}
