import {
  AmountToBeDeposited,
  AmountToBeDepositedParams,
  AmountToBeReceived,
  AmountToBeReceivedParams,
  AmountToBeWithdrawn,
  AmountToBeWithdrawnParams,
  AmountToSend,
  AmountToSendParams,
  FINANCIAL_POOL_PRECISION,
  LiquidityPool,
  PendingReward,
  PendingRewardParams,
  RpcOptions,
  UserDeposit,
  UserDepositParams,
} from '../../index';
import { FactoryContract } from '../models/generated/factory-contract';
import { ThreePool, ThreePoolContract } from '../models/generated/three-pool-contract';
import { TwoPool, TwoPoolContract } from '../models/generated/two-pool-contract';
import { convertFloatAmountToInt, convertIntAmountToFloat } from '../utils/calculations';
import { getContract } from '../utils/utils';
import { getPoolContractType, resolveTokenPairThreePool, resolveTokenPairTwoPool } from './utils';

export class PoolTxViewService {
  constructor(private rpcOptions: RpcOptions) {}

  async getPoolsFromFactory(initFactory: string): Promise<
    {
      poolAddress: string;
      pool: TwoPool | ThreePool | undefined;
    }[]
  > {
    const factoryContract = getContract(FactoryContract, initFactory, this.rpcOptions);
    const initPools = Array.from((await factoryContract.pools()).result.unwrap().values()).map((v) => v);

    return await Promise.all(
      initPools.map(async ([poolAddress, tokens]) => {
        return {
          poolAddress,
          pool: await this.getPool(poolAddress, tokens.length),
        };
      }),
    );
  }

  async getPool(poolAddress: string, tokensLength: number): Promise<TwoPool | ThreePool | undefined> {
    const contractType = getPoolContractType(tokensLength);
    const poolContract = getContract(contractType, poolAddress, this.rpcOptions);
    const result = (await poolContract.get_pool()).result;
    return result.isOk() ? result.unwrap() : undefined;
  }

  async getPendingReward(params: PendingRewardParams, pool: LiquidityPool): Promise<PendingReward> {
    const poolContract = getContract(getPoolContractType(pool.tokens.length), pool.address, this.rpcOptions);
    const rawBalances = (await poolContract.pending_reward({ user: params.user })).result.unwrap();
    const tokenBalances = rawBalances.map((balance, i) =>
      convertIntAmountToFloat(balance.toString(), pool.tokens[i].decimals).toFixed(),
    );
    return { tokenBalances };
  }

  async getUserDeposit(params: UserDepositParams, pool: LiquidityPool): Promise<UserDeposit> {
    const poolContract = getContract(getPoolContractType(pool.tokens.length), pool.address, this.rpcOptions);
    const userDeposit = (await poolContract.get_user_deposit({ user: params.user })).result.unwrap();
    return {
      lpAmount: convertIntAmountToFloat(userDeposit.lp_amount.toString(), FINANCIAL_POOL_PRECISION).toFixed(),
    };
  }

  async getAmountToBeReceived(params: AmountToBeReceivedParams, pool: LiquidityPool): Promise<AmountToBeReceived> {
    const amountInt = convertFloatAmountToInt(params.amount, params.sourceToken.decimals).toFixed();
    let receiveAmount, fee;

    if (pool.tokens.length === 2) {
      const poolContract = getContract(TwoPoolContract, pool.address, this.rpcOptions);
      const { tokenFrom, tokenTo } = resolveTokenPairTwoPool(
        pool,
        params.sourceToken.address,
        params.destToken.address,
      );
      [receiveAmount, fee] = (
        await poolContract.get_receive_amount({
          input: BigInt(amountInt),
          token_from: tokenFrom,
          token_to: tokenTo,
        })
      ).result.unwrap();
    } else {
      const poolContract = getContract(ThreePoolContract, pool.address, this.rpcOptions);
      const { tokenFrom, tokenTo } = resolveTokenPairThreePool(
        pool,
        params.sourceToken.address,
        params.destToken.address,
      );
      [receiveAmount, fee] = (
        await poolContract.get_receive_amount({
          input: BigInt(amountInt),
          token_from: tokenFrom,
          token_to: tokenTo,
        })
      ).result.unwrap();
    }

    return {
      receiveAmount: convertIntAmountToFloat(receiveAmount.toString(), params.destToken.decimals).toFixed(),
      fee: convertIntAmountToFloat(fee.toString(), params.destToken.decimals).toFixed(),
    };
  }

  async getAmountToSend(params: AmountToSendParams, pool: LiquidityPool): Promise<AmountToSend> {
    const amountInt = convertFloatAmountToInt(params.expectedAmount, params.destToken.decimals).toFixed();
    let amount, fee;

    if (pool.tokens.length === 2) {
      const poolContract = getContract(TwoPoolContract, pool.address, this.rpcOptions);
      const { tokenFrom, tokenTo } = resolveTokenPairTwoPool(
        pool,
        params.sourceToken.address,
        params.destToken.address,
      );
      [amount, fee] = (
        await poolContract.get_send_amount({
          output: BigInt(amountInt),
          token_from: tokenFrom,
          token_to: tokenTo,
        })
      ).result.unwrap();
    } else {
      const poolContract = getContract(ThreePoolContract, pool.address, this.rpcOptions);
      const { tokenFrom, tokenTo } = resolveTokenPairThreePool(
        pool,
        params.sourceToken.address,
        params.destToken.address,
      );
      [amount, fee] = (
        await poolContract.get_send_amount({
          output: BigInt(amountInt),
          token_from: tokenFrom,
          token_to: tokenTo,
        })
      ).result.unwrap();
    }

    return {
      amount: convertIntAmountToFloat(amount.toString(), params.sourceToken.decimals).toFixed(),
      fee: convertIntAmountToFloat(fee.toString(), params.sourceToken.decimals).toFixed(),
    };
  }

  async getAmountToBeDeposited(params: AmountToBeDepositedParams, pool: LiquidityPool): Promise<AmountToBeDeposited> {
    const poolContract = getContract(getPoolContractType(pool.tokens.length), pool.address, this.rpcOptions);
    const amountInts = params.tokenAmounts.map((amount, i) =>
      BigInt(convertFloatAmountToInt(amount, pool.tokens[i].decimals).toFixed()),
    );
    const lpAmount = (await poolContract.get_deposit_amount({ amounts: amountInts })).result.unwrap();

    return {
      lpAmount: convertIntAmountToFloat(lpAmount.toString(), FINANCIAL_POOL_PRECISION).toFixed(),
    };
  }

  async getAmountToBeWithdrawn(params: AmountToBeWithdrawnParams, pool: LiquidityPool): Promise<AmountToBeWithdrawn> {
    const poolContract = getContract(getPoolContractType(pool.tokens.length), pool.address, this.rpcOptions);
    const lpAmountInt = BigInt(convertFloatAmountToInt(params.lpAmount, FINANCIAL_POOL_PRECISION).toFixed());
    const withdrawAmountView = (await poolContract.get_withdraw_amount({ lp_amount: lpAmountInt })).result.unwrap();

    return {
      tokenAmounts: withdrawAmountView.amounts.map((amount) =>
        convertIntAmountToFloat(amount, FINANCIAL_POOL_PRECISION).toFixed(),
      ),
      tokenFees: withdrawAmountView.fees.map((fee, i) =>
        convertIntAmountToFloat(fee, pool.tokens[i].decimals).toFixed(),
      ),
    };
  }
}
