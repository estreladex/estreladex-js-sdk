import { Token } from './token';

export interface LiquidityPool {
  address: string;
  tokens: Token[];
}

export interface LiquidityPoolProperties extends LiquidityPool {
  feeShareBp: string;
}

export interface LiquidityPoolWithDetails extends LiquidityPool {
  tokenBalances: string[];
  totalLpAmount: string;
  apr?: string;
}
