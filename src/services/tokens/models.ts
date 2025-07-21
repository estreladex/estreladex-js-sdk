/* eslint-disable sort-exports/sort-exports */
export { TokenService } from './token-service';
export { TokenTxBuilder } from './token-tx-builder';

export interface BalanceLineParams {
  account: string;
  tokenAddress: string;
}

export interface TrustLineParams {
  sender: string;
  tokenAddress: string;
  /**
   * Float amount of tokens, default is Number.MAX_SAFE_INTEGER
   */
  limit?: string;
}
