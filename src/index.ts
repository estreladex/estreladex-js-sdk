/* eslint-disable sort-exports/sort-exports */
import { mainnetRpc, mainnetFactory, mainnetApiUrl } from './configs';
import { SdkError } from './models';
import { ApiService, ApiServiceInstance } from './services/api/api-service';
import { PoolService, PoolServiceInstance } from './services/pools/pool-service';
import { TokenService, TokenServiceInstance } from './services/tokens/token-service';
import { Utils, UtilsService } from './services/utils-service';

export * from './configs';
export * from './models';

export interface RpcOptions {
  sorobanNetworkPassphrase: string;
  sorobanRpcUrl: string;
  stellarRpcUrl: string;
}

export type RpcParams = {
  sorobanNetworkPassphrase?: string;
  sorobanRpcUrl?: string;
  stellarRpcUrl?: string;
};

export type SdkParams = {
  rpcOptions?: RpcOptions;
  initFactory?: string;
  apiUrl?: string;
};

export class EstrelaSdk {
  readonly initFactory: string;
  private _rpcOptions: RpcOptions;
  private readonly _apiUrl: string;
  private _token?: TokenService;
  private _pool?: PoolService;
  private _api?: ApiService;
  private _utils?: Utils;

  /**
   * Initialize the SDK object.
   * @param params
   * Optional.
   * If not defined, the default {@link mainnetRpc} parameters are used.
   */
  static async create(params?: SdkParams): Promise<EstrelaSdk> {
    const sdk = new EstrelaSdk(params);
    await sdk.initServices();
    return sdk;
  }

  private constructor(params?: SdkParams) {
    this._rpcOptions = params?.rpcOptions ?? mainnetRpc;
    this.initFactory = params?.initFactory ?? mainnetFactory;
    this._apiUrl = params?.apiUrl ?? mainnetApiUrl;
  }

  private async initServices(): Promise<void> {
    this._api = new ApiServiceInstance(this._apiUrl);
    this._token = new TokenServiceInstance(this._rpcOptions);
    this._pool = await PoolServiceInstance.create(this._api, this._rpcOptions, this.initFactory, this._token);
    this._utils = new UtilsService(this._rpcOptions);
  }

  get token(): TokenService {
    if (this._token) return this._token;
    throw new SdkError('tokenService not initialized');
  }

  get pool(): PoolService {
    if (this._pool) return this._pool;
    throw new SdkError('poolService not initialized');
  }

  get api(): ApiService {
    if (this._api) return this._api;
    throw new SdkError('apiService not initialized');
  }

  get utils(): Utils {
    if (this._utils) return this._utils;
    throw new SdkError('utils not initialized');
  }

  get rpcOptions(): RpcOptions {
    return this._rpcOptions;
  }

  /**
   * set Rpc urls
   * @param params
   * Optional.
   * If some property not defined, current parameters are used.
   */
  async setRpcUrls(params: RpcParams) {
    this._rpcOptions = { ...this._rpcOptions, ...params };
    await this.initServices();
  }
}
