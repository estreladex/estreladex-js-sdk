import BigNumber from 'bignumber.js';
import {
  AmountToBeDeposited,
  AmountToBeDepositedParams,
  AmountToBeReceived,
  AmountToBeReceivedParams,
  AmountToBeWithdrawn,
  AmountToBeWithdrawnParams,
  AmountToSend,
  AmountToSendParams,
  InvalidPoolAddressError,
  LiquidityPool,
  LiquidityPoolProperties,
  LiquidityPoolWithDetails,
  PendingReward,
  PendingRewardParams,
  PoolTxBuilder,
  RpcOptions,
  UserDeposit,
  UserDepositParams,
} from '../../index';
import { ApiService } from '../api/api-service';
import { AprResponse } from '../api/models';
import { FactoryContract } from '../models/generated/factory-contract';
import { ThreePool, ThreePoolContract } from '../models/generated/three-pool-contract';
import { TwoPool, TwoPoolContract, TwoToken } from '../models/generated/two-pool-contract';
import { TokenService } from '../tokens/token-service';
import { convertFloatAmountToInt, convertIntAmountToFloat } from '../utils/calculations';
import { FINANCIAL_POOL_PRECISION } from '../utils/constants';
import { getContract } from '../utils/utils';
import { validateAmountDecimals, validateAmountGteZero, validateAmountGtZero } from '../utils/validations';
import { PoolTxBuilderService } from './pool-tx-builder';
import { getPoolContractType, getThreeToken, transformLiquidityPoolPropertiesToLiquidityPool } from './utils';

export interface PoolService {
  get txBuilder(): PoolTxBuilder;

  getPool(poolAddress: string): LiquidityPool;

  getPools(): LiquidityPool[];

  getPoolsWithDetails(): Promise<LiquidityPoolWithDetails[]>;

  getAmountToSend(params: AmountToSendParams): Promise<AmountToSend>;

  getAmountToBeReceived(params: AmountToBeReceivedParams): Promise<AmountToBeReceived>;

  getPendingReward(params: PendingRewardParams): Promise<PendingReward>;

  getUserDeposit(params: UserDepositParams): Promise<UserDeposit>;

  getAmountToBeDeposited(params: AmountToBeDepositedParams): Promise<AmountToBeDeposited>;

  getAmountToBeWithdrawn(params: AmountToBeWithdrawnParams): Promise<AmountToBeWithdrawn>;
}

export class PoolServiceInstance implements PoolService {
  readonly txBuilder: PoolTxBuilder;
  private readonly poolsMap: Map<string, LiquidityPoolProperties> = new Map<string, LiquidityPoolProperties>();

  static async create(
    apiService: ApiService,
    rpcOptions: RpcOptions,
    initFactory: string,
    tokenService: TokenService,
  ): Promise<PoolServiceInstance> {
    const poolService = new PoolServiceInstance(apiService, rpcOptions, initFactory, tokenService);
    await poolService.initPools();
    return poolService;
  }

  private constructor(
    private readonly apiService: ApiService,
    private readonly rpcOptions: RpcOptions,
    private readonly initFactory: string,
    private readonly tokenService: TokenService,
  ) {
    this.txBuilder = new PoolTxBuilderService(rpcOptions, this);
  }

  private async initPools() {
    const factoryContract = getContract(FactoryContract, this.initFactory, this.rpcOptions);
    const initPools = Array.from((await factoryContract.pools()).result.unwrap().values()).map((v) => v);
    const promises = initPools.map((pool) => {
      const tokens = pool[1];
      const poolAddress = pool[0];
      return {
        poolAddress,
        poolPromise: getContract(getPoolContractType(tokens.length), poolAddress, this.rpcOptions).get_pool(),
      };
    });

    for (const promise of promises) {
      const result = (await promise.poolPromise).result;
      if (result.isOk()) {
        const fetchedPool: TwoPool | ThreePool = result.unwrap();
        const lpPool: LiquidityPoolProperties = {
          address: promise.poolAddress,
          tokens: await Promise.all(fetchedPool.tokens[0].map(async (add) => await this.tokenService.getToken(add))),
          feeShareBp: fetchedPool.fee_share_bp.toString(),
        };
        this.poolsMap.set(promise.poolAddress, lpPool);
      }
    }
  }

  getPool(poolAddress: string): LiquidityPool {
    const pool = this.poolsMap.get(poolAddress);
    if (!pool) {
      throw new InvalidPoolAddressError(poolAddress);
    }
    return transformLiquidityPoolPropertiesToLiquidityPool(pool);
  }

  getPools(): LiquidityPool[] {
    return Array.from(this.poolsMap.values()).map((pool) => transformLiquidityPoolPropertiesToLiquidityPool(pool));
  }

  async getPoolsWithDetails(): Promise<LiquidityPoolWithDetails[]> {
    const aprsPromise: Promise<AprResponse> = this.apiService.getApr().catch(() => ({}));

    const poolTasks = Array.from(this.poolsMap.values()).map(async (pool) => {
      const result = (
        await getContract(getPoolContractType(pool.tokens.length), pool.address, this.rpcOptions).get_pool()
      ).result;

      if (result.isOk()) {
        const fetchedPool = result.unwrap();
        return {
          address: pool.address,
          tokens: pool.tokens,
          tokenBalances: fetchedPool.token_balances[0].map((tokenBalance) =>
            convertIntAmountToFloat(tokenBalance.toString(), FINANCIAL_POOL_PRECISION).toFixed(),
          ),
          totalLpAmount: convertIntAmountToFloat(
            fetchedPool.total_lp_amount.toString(),
            FINANCIAL_POOL_PRECISION,
          ).toFixed(),
          fetchedPool,
        };
      }

      return null;
    });

    const [aprs, pools] = await Promise.all([aprsPromise, Promise.all(poolTasks)]);

    return pools
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .map((pool) => ({
        address: pool.address,
        tokens: pool.tokens,
        tokenBalances: pool.tokenBalances,
        totalLpAmount: pool.totalLpAmount,
        apr: aprs[pool.address],
      }));
  }

  async getPendingReward(params: PendingRewardParams): Promise<PendingReward> {
    const pool = this.getPool(params.poolAddress);
    const poolContract = getContract(getPoolContractType(pool.tokens.length), pool.address, this.rpcOptions);
    const result = (await poolContract.pending_reward({ user: params.user })).result.unwrap();
    return {
      tokenBalances: pool.tokens.map((token, i) =>
        convertIntAmountToFloat(result[i].toString(), token.decimals).toFixed(),
      ),
    };
  }

  async getUserDeposit(params: UserDepositParams): Promise<UserDeposit> {
    const pool = this.getPool(params.poolAddress);
    const poolContract = getContract(getPoolContractType(pool.tokens.length), params.poolAddress, this.rpcOptions);
    const userDeposit = (await poolContract.get_user_deposit({ user: params.user })).result.unwrap();
    return {
      lpAmount: convertIntAmountToFloat(userDeposit.lp_amount.toString(), FINANCIAL_POOL_PRECISION).toFixed(),
    };
  }

  async getAmountToBeReceived(params: AmountToBeReceivedParams): Promise<AmountToBeReceived> {
    const pool = this.getPool(params.poolAddress);
    validateAmountGtZero('amount', params.amount);
    validateAmountDecimals('amount', params.amount, params.sourceToken.decimals);
    const amountInt = convertFloatAmountToInt(params.amount, params.sourceToken.decimals).toFixed();
    let receiveAmount, fee;

    if (pool.tokens.length === 2) {
      const poolContract = getContract(TwoPoolContract, pool.address, this.rpcOptions);
      const tokenFrom: TwoToken = pool.tokens[0].address === params.sourceToken.address ? TwoToken.A : TwoToken.B;
      const tokenTo: TwoToken = pool.tokens[0].address === params.destToken.address ? TwoToken.A : TwoToken.B;
      [receiveAmount, fee] = (
        await poolContract.get_receive_amount({
          input: BigInt(amountInt),
          token_from: tokenFrom,
          token_to: tokenTo,
        })
      ).result.unwrap();
    } else {
      const poolContract = getContract(ThreePoolContract, pool.address, this.rpcOptions);
      const { tokenFrom, tokenTo } = getThreeToken(pool, params.sourceToken.address, params.destToken.address);
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

  async getAmountToSend(params: AmountToSendParams): Promise<AmountToSend> {
    const pool = this.getPool(params.poolAddress);
    validateAmountGtZero('expectedAmount', params.expectedAmount);
    validateAmountDecimals('expectedAmount', params.expectedAmount, params.destToken.decimals);
    const amountInt = convertFloatAmountToInt(params.expectedAmount, params.destToken.decimals).toFixed();
    let amount, fee;

    if (pool.tokens.length === 2) {
      const poolContract = getContract(TwoPoolContract, pool.address, this.rpcOptions);
      const tokenFrom: TwoToken = pool.tokens[0].address === params.sourceToken.address ? TwoToken.A : TwoToken.B;
      const tokenTo: TwoToken = pool.tokens[0].address === params.destToken.address ? TwoToken.A : TwoToken.B;
      [amount, fee] = (
        await poolContract.get_send_amount({
          output: BigInt(amountInt),
          token_from: tokenFrom,
          token_to: tokenTo,
        })
      ).result.unwrap();
    } else {
      const poolContract = getContract(ThreePoolContract, pool.address, this.rpcOptions);
      const { tokenFrom, tokenTo } = getThreeToken(pool, params.sourceToken.address, params.destToken.address);
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

  async getAmountToBeDeposited(params: AmountToBeDepositedParams): Promise<AmountToBeDeposited> {
    const pool = this.getPool(params.poolAddress);
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

    const poolContract = getContract(getPoolContractType(pool.tokens.length), params.poolAddress, this.rpcOptions);
    const amountInts = params.tokenAmounts.map((amount, index) =>
      BigInt(convertFloatAmountToInt(amount, pool.tokens[index].decimals).toFixed()),
    );
    const lpAmount = (await poolContract.get_deposit_amount({ amounts: amountInts })).result.unwrap();
    return {
      lpAmount: convertIntAmountToFloat(lpAmount.toString(), FINANCIAL_POOL_PRECISION).toFixed(),
    };
  }

  async getAmountToBeWithdrawn(params: AmountToBeWithdrawnParams): Promise<AmountToBeWithdrawn> {
    const pool = this.getPool(params.poolAddress);
    validateAmountGtZero('lpAmount', params.lpAmount);
    validateAmountDecimals('lpAmount', params.lpAmount, FINANCIAL_POOL_PRECISION);
    const poolContract = getContract(getPoolContractType(pool.tokens.length), pool.address, this.rpcOptions);
    const lpAmountInt = BigInt(convertFloatAmountToInt(params.lpAmount, FINANCIAL_POOL_PRECISION).toFixed());
    const withdrawAmountView = (await poolContract.get_withdraw_amount({ lp_amount: lpAmountInt })).result.unwrap();
    return {
      tokenAmounts: pool.tokens.map((token, i) =>
        convertIntAmountToFloat(withdrawAmountView.amounts[i].toString(), FINANCIAL_POOL_PRECISION).toFixed(),
      ),
      tokenFees: pool.tokens.map((token, i) =>
        convertIntAmountToFloat(withdrawAmountView.fees[i].toString(), token.decimals).toFixed(),
      ),
    };
  }
}
