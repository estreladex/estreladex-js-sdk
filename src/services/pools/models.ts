/* eslint-disable sort-exports/sort-exports */
import { Token } from '../../models';

export { PoolService } from './pool-service';
export { PoolTxBuilder } from './pool-tx-builder';

export interface AmountToBeDeposited {
  lpAmount: string;
}

export interface AmountToBeDepositedParams {
  poolAddress: string;
  tokenAmounts: string[];
}

export interface AmountToBeReceived {
  receiveAmount: string;
  fee: string;
}

export interface AmountToBeReceivedParams {
  amount: string;
  poolAddress: string;
  sourceToken: Token;
  destToken: Token;
}

export interface AmountToBeWithdrawn {
  tokenAmounts: string[];
  tokenFees: string[];
}

export interface AmountToBeWithdrawnParams {
  poolAddress: string;
  lpAmount: string;
}

export interface AmountToSend {
  amount: string;
  fee: string;
}

export interface AmountToSendParams {
  expectedAmount: string;
  poolAddress: string;
  sourceToken: Token;
  destToken: Token;
}

export interface ClaimRewardsParams {
  sender: string;
  poolAddress: string;
}

export interface DepositParams {
  sender: string;
  poolAddress: string;
  tokenAmounts: string[];
  minLpAmount: string;
}

export interface PendingReward {
  tokenBalances: string[];
}

export interface PendingRewardParams {
  user: string;
  poolAddress: string;
}

export interface SwapParams {
  sender: string;
  recipient: string;
  amount: string;
  receiveAmountMin: string;
  poolAddress: string;
  sourceToken: Token;
  destToken: Token;
}

export interface UserDeposit {
  lpAmount: string;
}

export interface UserDepositParams {
  user: string;
  poolAddress: string;
}

export interface WithdrawParams {
  sender: string;
  poolAddress: string;
  lpAmount: string;
}
