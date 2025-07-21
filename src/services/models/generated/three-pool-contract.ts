import { Buffer } from 'buffer';

import { contract } from '@stellar/stellar-sdk';
import u32 = contract.u32;
import u128 = contract.u128;
import AssembledTransaction = contract.AssembledTransaction;
import ContractSpec = contract.Spec;
import ContractClient = contract.Client;
import ContractClientOptions = contract.ClientOptions;
import Result = contract.Result;

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CCYK6EREYDT5UUCYRGX2U2XR35HWG3FMHC6QPJEQVOTY3PJVCNLWAND5',
  },
} as const;

export interface ThreePool {
  a: u128;
  acc_rewards_per_share_p: SizedU128Array;
  admin_fee_amount: SizedU128Array;
  admin_fee_share_bp: u128;
  fee_share_bp: u128;
  token_balances: SizedU128Array;
  tokens: SizedAddressArray;
  tokens_decimals: SizedDecimalsArray;
  total_lp_amount: u128;
}

export enum ThreeToken {
  A = 0,
  B = 1,
  C = 2,
}

export interface Swapped {
  /**
   * token precision
   */
  fee: u128;
  /**
   * token precision
   */
  from_amount: u128;
  from_token: string;
  recipient: string;
  sender: string;
  /**
   * token precision
   */
  to_amount: u128;
  to_token: string;
}

export interface Deposit {
  /**
   * token precision
   */
  amounts: Array<u128>;
  /**
   * system precision
   */
  lp_amount: u128;
  user: string;
}

export interface Withdraw {
  amounts: Array<u128>;
  /**
   * token precision
   */
  fees: Array<u128>;
  /**
   * system precision
   */
  lp_amount: u128;
  user: string;
}

export interface RewardsClaimed {
  /**
   * token precision
   */
  rewards: Array<u128>;
  user: string;
}

export interface WithdrawAmountView {
  /**
   * system precision
   */
  amounts: Array<u128>;
  /**
   * token precision
   */
  fees: Array<u128>;
}

export type SizedAddressArray = readonly [Array<string>];
export type SizedU128Array = readonly [Array<u128>];
export type SizedDecimalsArray = readonly [Array<u32>];

export interface UserDeposit {
  lp_amount: u128;
  reward_debts: SizedU128Array;
}

export const Errors = {
  0: { message: '' },
  1: { message: '' },
  2: { message: '' },
  3: { message: '' },
  4: { message: '' },
  5: { message: '' },
  6: { message: '' },
  7: { message: '' },
  9: { message: '' },
  10: { message: '' },
  11: { message: '' },
  13: { message: '' },
  100: { message: '' },
  101: { message: '' },
  102: { message: '' },
  103: { message: '' },
  104: { message: '' },
  105: { message: '' },
  106: { message: '' },
  200: { message: '' },
  201: { message: '' },
  202: { message: '' },
  203: { message: '' },
};
export type Admin = readonly [string];

export interface ThreePoolContract {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: (
    {
      admin,
      a,
      tokens,
      fee_share_bp,
      admin_fee_share_bp,
    }: { admin: string; a: u128; tokens: Array<string>; fee_share_bp: u128; admin_fee_share_bp: u128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deposit: (
    { sender, amounts, min_lp_amount }: { sender: string; amounts: Array<u128>; min_lp_amount: u128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw: (
    { sender, lp_amount }: { sender: string; lp_amount: u128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a swap transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  swap: (
    {
      sender,
      recipient,
      amount_in,
      receive_amount_min,
      token_from,
      token_to,
    }: {
      sender: string;
      recipient: string;
      amount_in: u128;
      receive_amount_min: u128;
      token_from: ThreeToken;
      token_to: ThreeToken;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<u128>>>;

  /**
   * Construct and simulate a claim_rewards transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_rewards: (
    { sender }: { sender: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a claim_admin_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_admin_fee: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_admin: (
    { new_admin }: { new_admin: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_admin_fee_share transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_admin_fee_share: (
    { admin_fee_share_bp }: { admin_fee_share_bp: u128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a set_fee_share transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_fee_share: (
    { fee_share_bp }: { fee_share_bp: u128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;

  /**
   * Construct and simulate a pending_reward transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pending_reward: (
    { user }: { user: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<Array<u128>>>>;

  /**
   * Construct and simulate a get_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pool: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<ThreePool>>>;

  /**
   * Construct and simulate a get_user_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_user_deposit: (
    { user }: { user: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<UserDeposit>>>;

  /**
   * Construct and simulate a get_d transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_d: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<u128>>>;

  /**
   * Construct and simulate a get_receive_amount transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_receive_amount: (
    { input, token_from, token_to }: { input: u128; token_from: ThreeToken; token_to: ThreeToken },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<Array<u128>>>>;

  /**
   * Construct and simulate a get_send_amount transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_send_amount: (
    { output, token_from, token_to }: { output: u128; token_from: ThreeToken; token_to: ThreeToken },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<Array<u128>>>>;

  /**
   * Construct and simulate a get_withdraw_amount transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_withdraw_amount: (
    { lp_amount }: { lp_amount: u128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<WithdrawAmountView>>>;

  /**
   * Construct and simulate a get_deposit_amount transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_deposit_amount: (
    { amounts }: { amounts: Array<u128> },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<u128>>>;

  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_admin: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<string>>>;

  /**
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: (
    { new_wasm_hash }: { new_wasm_hash: Buffer },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
}

export class ThreePoolContract extends ContractClient {
  constructor(public override readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        'AAAAAQAAAAAAAAAAAAAACVRocmVlUG9vbAAAAAAAAAkAAAAAAAAAAWEAAAAAAAAKAAAAAAAAABdhY2NfcmV3YXJkc19wZXJfc2hhcmVfcAAAAAfQAAAADlNpemVkVTEyOEFycmF5AAAAAAAAAAAAEGFkbWluX2ZlZV9hbW91bnQAAAfQAAAADlNpemVkVTEyOEFycmF5AAAAAAAAAAAAEmFkbWluX2ZlZV9zaGFyZV9icAAAAAAACgAAAAAAAAAMZmVlX3NoYXJlX2JwAAAACgAAAAAAAAAOdG9rZW5fYmFsYW5jZXMAAAAAB9AAAAAOU2l6ZWRVMTI4QXJyYXkAAAAAAAAAAAAGdG9rZW5zAAAAAAfQAAAAEVNpemVkQWRkcmVzc0FycmF5AAAAAAAAAAAAAA90b2tlbnNfZGVjaW1hbHMAAAAH0AAAABJTaXplZERlY2ltYWxzQXJyYXkAAAAAAAAAAAAPdG90YWxfbHBfYW1vdW50AAAAAAo=',
        'AAAAAwAAAAAAAAAAAAAAClRocmVlVG9rZW4AAAAAAAMAAAAAAAAAAUEAAAAAAAAAAAAAAAAAAAFCAAAAAAAAAQAAAAAAAAABQwAAAAAAAAI=',
        'AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAFhAAAAAAAACgAAAAAAAAAGdG9rZW5zAAAAAAPqAAAAEwAAAAAAAAAMZmVlX3NoYXJlX2JwAAAACgAAAAAAAAASYWRtaW5fZmVlX3NoYXJlX2JwAAAAAAAKAAAAAQAAA+kAAAPtAAAAAAAAAAM=',
        'AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAADAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAAB2Ftb3VudHMAAAAD6gAAAAoAAAAAAAAADW1pbl9scF9hbW91bnQAAAAAAAAKAAAAAQAAA+kAAAPtAAAAAAAAAAM=',
        'AAAAAAAAAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAZzZW5kZXIAAAAAABMAAAAAAAAACWxwX2Ftb3VudAAAAAAAAAoAAAABAAAD6QAAA+0AAAAAAAAAAw==',
        'AAAAAAAAAAAAAAAEc3dhcAAAAAYAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEwAAAAAAAAAJYW1vdW50X2luAAAAAAAACgAAAAAAAAAScmVjZWl2ZV9hbW91bnRfbWluAAAAAAAKAAAAAAAAAAp0b2tlbl9mcm9tAAAAAAfQAAAAClRocmVlVG9rZW4AAAAAAAAAAAAIdG9rZW5fdG8AAAfQAAAAClRocmVlVG9rZW4AAAAAAAEAAAPpAAAACgAAAAM=',
        'AAAAAAAAAAAAAAANY2xhaW1fcmV3YXJkcwAAAAAAAAEAAAAAAAAABnNlbmRlcgAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD',
        'AAAAAAAAAAAAAAAPY2xhaW1fYWRtaW5fZmVlAAAAAAAAAAABAAAD6QAAA+0AAAAAAAAAAw==',
        'AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD',
        'AAAAAAAAAAAAAAATc2V0X2FkbWluX2ZlZV9zaGFyZQAAAAABAAAAAAAAABJhZG1pbl9mZWVfc2hhcmVfYnAAAAAAAAoAAAABAAAD6QAAA+0AAAAAAAAAAw==',
        'AAAAAAAAAAAAAAANc2V0X2ZlZV9zaGFyZQAAAAAAAAEAAAAAAAAADGZlZV9zaGFyZV9icAAAAAoAAAABAAAD6QAAA+0AAAAAAAAAAw==',
        'AAAAAAAAAAAAAAAOcGVuZGluZ19yZXdhcmQAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+kAAAPqAAAACgAAAAM=',
        'AAAAAAAAAAAAAAAIZ2V0X3Bvb2wAAAAAAAAAAQAAA+kAAAfQAAAACVRocmVlUG9vbAAAAAAAAAM=',
        'AAAAAAAAAAAAAAAQZ2V0X3VzZXJfZGVwb3NpdAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+kAAAfQAAAAC1VzZXJEZXBvc2l0AAAAAAM=',
        'AAAAAAAAAAAAAAAFZ2V0X2QAAAAAAAAAAAAAAQAAA+kAAAAKAAAAAw==',
        'AAAAAAAAAAAAAAASZ2V0X3JlY2VpdmVfYW1vdW50AAAAAAADAAAAAAAAAAVpbnB1dAAAAAAAAAoAAAAAAAAACnRva2VuX2Zyb20AAAAAB9AAAAAKVGhyZWVUb2tlbgAAAAAAAAAAAAh0b2tlbl90bwAAB9AAAAAKVGhyZWVUb2tlbgAAAAAAAQAAA+kAAAPqAAAACgAAAAM=',
        'AAAAAAAAAAAAAAAPZ2V0X3NlbmRfYW1vdW50AAAAAAMAAAAAAAAABm91dHB1dAAAAAAACgAAAAAAAAAKdG9rZW5fZnJvbQAAAAAH0AAAAApUaHJlZVRva2VuAAAAAAAAAAAACHRva2VuX3RvAAAH0AAAAApUaHJlZVRva2VuAAAAAAABAAAD6QAAA+oAAAAKAAAAAw==',
        'AAAAAAAAAAAAAAATZ2V0X3dpdGhkcmF3X2Ftb3VudAAAAAABAAAAAAAAAAlscF9hbW91bnQAAAAAAAAKAAAAAQAAA+kAAAfQAAAAEldpdGhkcmF3QW1vdW50VmlldwAAAAAAAw==',
        'AAAAAAAAAAAAAAASZ2V0X2RlcG9zaXRfYW1vdW50AAAAAAABAAAAAAAAAAdhbW91bnRzAAAAA+oAAAAKAAAAAQAAA+kAAAAKAAAAAw==',
        'AAAAAAAAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAPpAAAAEwAAAAM=',
        'AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAA+0AAAAAAAAAAw==',
        'AAAAAQAAAAAAAAAAAAAAB1N3YXBwZWQAAAAABwAAAA90b2tlbiBwcmVjaXNpb24AAAAAA2ZlZQAAAAAKAAAAD3Rva2VuIHByZWNpc2lvbgAAAAALZnJvbV9hbW91bnQAAAAACgAAAAAAAAAKZnJvbV90b2tlbgAAAAAAEwAAAAAAAAAJcmVjaXBpZW50AAAAAAAAEwAAAAAAAAAGc2VuZGVyAAAAAAATAAAAD3Rva2VuIHByZWNpc2lvbgAAAAAJdG9fYW1vdW50AAAAAAAACgAAAAAAAAAIdG9fdG9rZW4AAAAT',
        'AAAAAQAAAAAAAAAAAAAAB0RlcG9zaXQAAAAAAwAAAA90b2tlbiBwcmVjaXNpb24AAAAAB2Ftb3VudHMAAAAD6gAAAAoAAAAQc3lzdGVtIHByZWNpc2lvbgAAAAlscF9hbW91bnQAAAAAAAAKAAAAAAAAAAR1c2VyAAAAEw==',
        'AAAAAQAAAAAAAAAAAAAACFdpdGhkcmF3AAAABAAAAAAAAAAHYW1vdW50cwAAAAPqAAAACgAAAA90b2tlbiBwcmVjaXNpb24AAAAABGZlZXMAAAPqAAAACgAAABBzeXN0ZW0gcHJlY2lzaW9uAAAACWxwX2Ftb3VudAAAAAAAAAoAAAAAAAAABHVzZXIAAAAT',
        'AAAAAQAAAAAAAAAAAAAADlJld2FyZHNDbGFpbWVkAAAAAAACAAAAD3Rva2VuIHByZWNpc2lvbgAAAAAHcmV3YXJkcwAAAAPqAAAACgAAAAAAAAAEdXNlcgAAABM=',
        'AAAAAQAAAAAAAAAAAAAAEldpdGhkcmF3QW1vdW50VmlldwAAAAAAAgAAABBzeXN0ZW0gcHJlY2lzaW9uAAAAB2Ftb3VudHMAAAAD6gAAAAoAAAAPdG9rZW4gcHJlY2lzaW9uAAAAAARmZWVzAAAD6gAAAAo=',
        'AAAAAQAAAAAAAAAAAAAAEVNpemVkQWRkcmVzc0FycmF5AAAAAAAAAQAAAAAAAAABMAAAAAAAA+oAAAAT',
        'AAAAAQAAAAAAAAAAAAAADlNpemVkVTEyOEFycmF5AAAAAAABAAAAAAAAAAEwAAAAAAAD6gAAAAo=',
        'AAAAAQAAAAAAAAAAAAAAElNpemVkRGVjaW1hbHNBcnJheQAAAAAAAQAAAAAAAAABMAAAAAAAA+oAAAAE',
        'AAAAAQAAAAAAAAAAAAAAC1VzZXJEZXBvc2l0AAAAAAIAAAAAAAAACWxwX2Ftb3VudAAAAAAAAAoAAAAAAAAADHJld2FyZF9kZWJ0cwAAB9AAAAAOU2l6ZWRVMTI4QXJyYXkAAA==',
        'AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAFwAAAAAAAAANVW5pbXBsZW1lbnRlZAAAAAAAAAAAAAAAAAAAC0luaXRpYWxpemVkAAAAAAEAAAAAAAAADVVuaW5pdGlhbGl6ZWQAAAAAAAACAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAADAAAAAAAAAApJbnZhbGlkQXJnAAAAAAAEAAAAAAAAAA1Ccm9rZW5BZGRyZXNzAAAAAAAABQAAAAAAAAAITm90Rm91bmQAAAAGAAAAAAAAAAlGb3JiaWRkZW4AAAAAAAAHAAAAAAAAAApDYXN0RmFpbGVkAAAAAAAJAAAAAAAAABhUb2tlbkluc3VmZmljaWVudEJhbGFuY2UAAAAKAAAAAAAAAAxVMjU2T3ZlcmZsb3cAAAALAAAAAAAAABFVbmV4cGVjdGVkVmVjU2l6ZQAAAAAAAA0AAAAAAAAAClplcm9BbW91bnQAAAAAAGQAAAAAAAAADFBvb2xPdmVyZmxvdwAAAGUAAAAAAAAAC1plcm9DaGFuZ2VzAAAAAGYAAAAAAAAAD05vdEVub3VnaEFtb3VudAAAAABnAAAAAAAAABpJbnN1ZmZpY2llbnRSZWNlaXZlZEFtb3VudAAAAAAAaAAAAAAAAAAIU2xpcHBhZ2UAAABpAAAAAAAAABNJbnZhbGlkRmlyc3REZXBvc2l0AAAAAGoAAAAAAAAACVBvb2xFeGlzdAAAAAAAAMgAAAAAAAAAEklkZW50aWNhbEFkZHJlc3NlcwAAAAAAyQAAAAAAAAASTWF4UG9vbHNOdW1SZWFjaGVkAAAAAADKAAAAAAAAABVJbnZhbGlkTnVtYmVyT2ZUb2tlbnMAAAAAAADL',
        'AAAAAQAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAABMAAAAAAAABM=',
      ]),
      options,
    );
  }

  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
    deposit: this.txFromJSON<Result<void>>,
    withdraw: this.txFromJSON<Result<void>>,
    swap: this.txFromJSON<Result<u128>>,
    claim_rewards: this.txFromJSON<Result<void>>,
    claim_admin_fee: this.txFromJSON<Result<void>>,
    set_admin: this.txFromJSON<Result<void>>,
    set_admin_fee_share: this.txFromJSON<Result<void>>,
    set_fee_share: this.txFromJSON<Result<void>>,
    pending_reward: this.txFromJSON<Result<Array<u128>>>,
    get_pool: this.txFromJSON<Result<ThreePool>>,
    get_user_deposit: this.txFromJSON<Result<UserDeposit>>,
    get_d: this.txFromJSON<Result<u128>>,
    get_receive_amount: this.txFromJSON<Result<Array<u128>>>,
    get_send_amount: this.txFromJSON<Result<Array<u128>>>,
    get_withdraw_amount: this.txFromJSON<Result<WithdrawAmountView>>,
    get_deposit_amount: this.txFromJSON<Result<u128>>,
    get_admin: this.txFromJSON<Result<string>>,
    upgrade: this.txFromJSON<Result<void>>,
  };
}
