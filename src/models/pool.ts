import { Token } from './token';

export interface LiquidityPool {
  address: string;
  tokens: Token[];
}

export interface LiquidityPoolExtended extends LiquidityPool {
  feeShareBp: string;
}

export interface LiquidityPoolSnapshot extends LiquidityPool {
  tokenBalances: string[];
  totalLpAmount: string;
  apr?: string;
}
