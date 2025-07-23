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
  LiquidityPoolExtended,
  LiquidityPoolSnapshot,
  PendingReward,
  PendingRewardParams,
  PoolTxBuilder,
  RpcOptions,
  UserDeposit,
  UserDepositParams,
} from '../../index';
import { ApiService } from '../api/api-service';
import { AprResponse } from '../api/models';
import { ThreePool } from '../models/generated/three-pool-contract';
import { TwoPool } from '../models/generated/two-pool-contract';
import { TokenService } from '../tokens/token-service';
import { CacheService } from '../utils/cache.service';
import { convertIntAmountToFloat } from '../utils/calculations';
import { FINANCIAL_POOL_PRECISION } from '../utils/constants';
import {
  validateAmountDecimals,
  validateAmountGteZero,
  validateAmountGtZero,
  validateArraysSameLength,
} from '../utils/validations';
import {
  calculateAmountToBeDeposited,
  calculateAmountToBeReceived,
  calculateAmountToBeWithdrawn,
  calculateAmountToSend,
} from './calculation.utils';
import { PoolTxBuilderService } from './pool-tx-builder';
import { PoolTxViewService } from './pool-tx-view';
import { normalizeLiquidityPool } from './utils';

/**
 * Pool service interface for accessing liquidity pool data and calculations.
 *
 * @remarks
 * Most methods accept an optional `mode`:
 * - `'local'` (default): Uses cached onchain state (~1 min) for fast offchain calculations.
 * - `'contract'`: Uses live onchain data for maximum accuracy.
 */
export interface PoolService {
  get txBuilder(): PoolTxBuilder;

  getPool(poolAddress: string): LiquidityPool;

  getPools(): LiquidityPool[];

  getPoolSnapshot(poolAddress: string): Promise<LiquidityPoolSnapshot>;

  getPoolsSnapshot(): Promise<LiquidityPoolSnapshot[]>;

  getPendingReward(params: PendingRewardParams): Promise<PendingReward>;

  getUserDeposit(params: UserDepositParams): Promise<UserDeposit>;

  getAmountToBeReceived(params: AmountToBeReceivedParams, mode?: 'local' | 'contract'): Promise<AmountToBeReceived>;

  getAmountToSend(params: AmountToSendParams, mode?: 'local' | 'contract'): Promise<AmountToSend>;

  getAmountToBeDeposited(params: AmountToBeDepositedParams, mode?: 'local' | 'contract'): Promise<AmountToBeDeposited>;

  getAmountToBeWithdrawn(params: AmountToBeWithdrawnParams, mode?: 'local' | 'contract'): Promise<AmountToBeWithdrawn>;
}

export class PoolServiceInstance implements PoolService {
  readonly txBuilder: PoolTxBuilder;
  private readonly txViewService: PoolTxViewService;
  private readonly poolsMap: Map<string, LiquidityPoolExtended> = new Map<string, LiquidityPoolExtended>();

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
    readonly rpcOptions: RpcOptions,
    private readonly initFactory: string,
    private readonly tokenService: TokenService,
  ) {
    this.txBuilder = new PoolTxBuilderService(rpcOptions, this);
    this.txViewService = new PoolTxViewService(rpcOptions);
  }

  private async initPools() {
    const pools = await this.txViewService.getPoolsFromFactory(this.initFactory);
    const aprs = await this.apiService.getApr().catch(() => undefined);

    for (const pool of pools) {
      const fetchedPool = pool.pool;
      if (fetchedPool !== undefined) {
        const lpPool: LiquidityPoolExtended = {
          address: pool.poolAddress,
          tokens: await Promise.all(fetchedPool.tokens[0].map(async (add) => await this.tokenService.getToken(add))),
          feeShareBp: fetchedPool.fee_share_bp.toString(),
        };
        this.poolsMap.set(pool.poolAddress, lpPool);

        CacheService.instance.setValue(
          lpPool.address.toLowerCase(),
          this.parseFetchPoolSnapshot(lpPool, fetchedPool, aprs),
        );
      }
    }
  }

  // Public methods
  getPool(poolAddress: string): LiquidityPool {
    return normalizeLiquidityPool(this.getPoolExtended(poolAddress));
  }

  getPools(): LiquidityPool[] {
    return Array.from(this.poolsMap.keys()).map((address) => this.getPool(address));
  }

  async getPoolSnapshot(poolAddress: string): Promise<LiquidityPoolSnapshot> {
    const pool = this.getPool(poolAddress);
    const aprs = await this.apiService.getApr().catch(() => undefined);
    return this.fetchPoolSnapshot(pool, aprs);
  }

  async getPoolsSnapshot(): Promise<LiquidityPoolSnapshot[]> {
    const aprs = await this.apiService.getApr().catch(() => undefined);
    const poolsSnapshot = await Promise.all(
      Array.from(this.poolsMap.values()).map(async (pool) => {
        try {
          return await this.fetchPoolSnapshot(pool, aprs);
        } catch {
          return null;
        }
      }),
    );
    return poolsSnapshot.filter((p): p is LiquidityPoolSnapshot => p !== null);
  }

  async getPendingReward(params: PendingRewardParams): Promise<PendingReward> {
    return this.txViewService.getPendingReward(params, this.getPool(params.poolAddress));
  }

  async getUserDeposit(params: UserDepositParams): Promise<UserDeposit> {
    return this.txViewService.getUserDeposit(params, this.getPool(params.poolAddress));
  }

  async getAmountToBeReceived(
    params: AmountToBeReceivedParams,
    mode: 'local' | 'contract' = 'local',
  ): Promise<AmountToBeReceived> {
    validateAmountGtZero('amount', params.amount);
    validateAmountDecimals('amount', params.amount, params.sourceToken.decimals);

    switch (mode) {
      case 'local':
        return this.getAmountToBeReceivedFromCache(params);
      case 'contract':
        return this.txViewService.getAmountToBeReceived(params, this.getPool(params.poolAddress));
    }
  }

  async getAmountToSend(params: AmountToSendParams, mode: 'local' | 'contract' = 'local'): Promise<AmountToSend> {
    validateAmountGtZero('expectedAmount', params.expectedAmount);
    validateAmountDecimals('expectedAmount', params.expectedAmount, params.destToken.decimals);

    switch (mode) {
      case 'local':
        return this.getAmountToSendFromCache(params);
      case 'contract':
        return this.txViewService.getAmountToSend(params, this.getPool(params.poolAddress));
    }
  }

  async getAmountToBeDeposited(
    params: AmountToBeDepositedParams,
    mode: 'local' | 'contract' = 'local',
  ): Promise<AmountToBeDeposited> {
    const pool = this.getPool(params.poolAddress);
    params.tokenAmounts.map((amount, index) => validateAmountGteZero(`tokenAmounts[${index}]`, amount));
    validateAmountGtZero(
      'sum of tokenAmounts',
      params.tokenAmounts.reduce((acc, current) => {
        return acc.plus(current);
      }, BigNumber(0)),
    );
    validateArraysSameLength('param.tokenAmounts', 'PoolTokens', params.tokenAmounts, pool.tokens);
    params.tokenAmounts.map((amount, index) =>
      validateAmountDecimals(`tokenAmounts[${index}]`, amount, pool.tokens[index].decimals),
    );

    switch (mode) {
      case 'local':
        return this.getAmountToBeDepositedFromCache(params);
      case 'contract':
        return this.txViewService.getAmountToBeDeposited(params, this.getPool(params.poolAddress));
    }
  }

  async getAmountToBeWithdrawn(
    params: AmountToBeWithdrawnParams,
    mode: 'local' | 'contract' = 'local',
  ): Promise<AmountToBeWithdrawn> {
    validateAmountGtZero('lpAmount', params.lpAmount);
    validateAmountDecimals('lpAmount', params.lpAmount, FINANCIAL_POOL_PRECISION);

    switch (mode) {
      case 'local':
        return this.getAmountToBeWithdrawnFromCache(params);
      case 'contract':
        return this.txViewService.getAmountToBeWithdrawn(params, this.getPool(params.poolAddress));
    }
  }

  // Private calculations
  private async getAmountToBeReceivedFromCache(params: AmountToBeReceivedParams): Promise<AmountToBeReceived> {
    const pool = await this.getPoolExtendedSnapshotCacheable(params.poolAddress);
    return calculateAmountToBeReceived(params, pool);
  }

  private async getAmountToSendFromCache(params: AmountToSendParams): Promise<AmountToSend> {
    const pool = await this.getPoolExtendedSnapshotCacheable(params.poolAddress);
    return calculateAmountToSend(params, pool);
  }

  private async getAmountToBeDepositedFromCache(params: AmountToBeDepositedParams): Promise<AmountToBeDeposited> {
    const pool = await this.getPoolExtendedSnapshotCacheable(params.poolAddress);
    return calculateAmountToBeDeposited(params, pool);
  }

  private async getAmountToBeWithdrawnFromCache(params: AmountToBeWithdrawnParams): Promise<AmountToBeWithdrawn> {
    const pool = await this.getPoolExtendedSnapshotCacheable(params.poolAddress);
    return calculateAmountToBeWithdrawn(params, pool);
  }

  // Internal utilities
  private getPoolExtended(poolAddress: string): LiquidityPoolExtended {
    const pool = this.poolsMap.get(poolAddress);
    if (!pool) {
      throw new InvalidPoolAddressError(poolAddress);
    }
    return pool;
  }

  private async getPoolExtendedSnapshotCacheable(
    poolAddress: string,
  ): Promise<LiquidityPoolExtended & LiquidityPoolSnapshot> {
    const poolSnapshot = await CacheService.instance.getOrCache(
      poolAddress.toLowerCase(),
      () => this.getPoolSnapshot(poolAddress),
      {
        ttlSec: 45,
        lazy: {
          expireSec: 90,
        },
      },
    );
    if (!poolSnapshot) {
      throw new Error(`Failed to get pool snapshot for ${poolAddress}`);
    }
    return {
      ...poolSnapshot,
      feeShareBp: this.getPoolExtended(poolAddress).feeShareBp,
    };
  }

  // Private helpers
  private async fetchPoolSnapshot(pool: LiquidityPool, aprs: AprResponse | undefined): Promise<LiquidityPoolSnapshot> {
    const fetchedPool = await this.txViewService.getPool(pool.address, pool.tokens.length);
    if (!fetchedPool) {
      throw new Error(`Failed to fetch pool data for ${pool.address}`);
    }
    const poolSnapshot = this.parseFetchPoolSnapshot(pool, fetchedPool, aprs);

    CacheService.instance.setValue(pool.address.toLowerCase(), poolSnapshot);
    return poolSnapshot;
  }

  private parseFetchPoolSnapshot(
    pool: LiquidityPool,
    fetchedPool: TwoPool | ThreePool,
    aprs: AprResponse | undefined,
  ): LiquidityPoolSnapshot {
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
      apr: aprs?.[pool.address],
    };
  }
}
