import { Buffer } from 'buffer';

import { contract } from '@stellar/stellar-sdk';
import u128 = contract.u128;
import AssembledTransaction = contract.AssembledTransaction;
import Result = contract.Result;
import ContractSpec = contract.Spec;
import ContractClient = contract.Client;
import ContractClientOptions = contract.ClientOptions;

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  testnet: {
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CDDUAK5NXJ45M5WB32KHTFB7UXJGOKSXY3NGXNEA33BUIJANXXUVBUDE',
  },
} as const;

export interface FactoryInfo {
  pools: Map<Array<string>, string>;
  three_pool_wasm_hash: Buffer;
  two_pool_wasm_hash: Buffer;
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

export interface FactoryContract {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: (
    {
      two_pool_wasm_hash,
      three_pool_wasm_hash,
      admin,
    }: { two_pool_wasm_hash: Buffer; three_pool_wasm_hash: Buffer; admin: string },
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
   * Construct and simulate a create_pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_pool: (
    {
      deployer,
      pool_admin,
      a,
      tokens,
      fee_share_bp,
      admin_fee_share_bp,
    }: {
      deployer: string;
      pool_admin: string;
      a: u128;
      tokens: Array<string>;
      fee_share_bp: u128;
      admin_fee_share_bp: u128;
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
  ) => Promise<AssembledTransaction<Result<string>>>;

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
   * Construct and simulate a pool transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pool: (
    { tokens }: { tokens: Array<string> },
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
  ) => Promise<AssembledTransaction<Result<string>>>;

  /**
   * Construct and simulate a pools transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pools: (options?: {
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
  }) => Promise<AssembledTransaction<Result<Map<string, Array<string>>>>>;

  /**
   * Construct and simulate a get_two_pool_wasm_hash transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_two_pool_wasm_hash: (options?: {
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
  }) => Promise<AssembledTransaction<Result<Buffer>>>;

  /**
   * Construct and simulate a get_three_pool_wasm_hash transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_three_pool_wasm_hash: (options?: {
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
  }) => Promise<AssembledTransaction<Result<Buffer>>>;

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
   * Construct and simulate a update_two_pool_wasm_hash transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_two_pool_wasm_hash: (
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

  /**
   * Construct and simulate a update_three_pool_wasm_hash transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_three_pool_wasm_hash: (
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
export class FactoryContract extends ContractClient {
  constructor(public override readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        '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',
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
    create_pool: this.txFromJSON<Result<string>>,
    set_admin: this.txFromJSON<Result<void>>,
    pool: this.txFromJSON<Result<string>>,
    pools: this.txFromJSON<Result<Map<string, Array<string>>>>,
    get_two_pool_wasm_hash: this.txFromJSON<Result<Buffer>>,
    get_three_pool_wasm_hash: this.txFromJSON<Result<Buffer>>,
    get_admin: this.txFromJSON<Result<string>>,
    update_two_pool_wasm_hash: this.txFromJSON<Result<void>>,
    update_three_pool_wasm_hash: this.txFromJSON<Result<void>>,
    upgrade: this.txFromJSON<Result<void>>,
  };
}
