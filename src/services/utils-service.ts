import { Horizon, rpc as SorobanRpc, Transaction, TransactionBuilder } from '@stellar/stellar-sdk';
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon';
import { RpcOptions } from '../index';
import { withExponentialBackoff } from './utils/utils';

export interface Utils {
  /**
   *
   * @param xdrTx
   */
  submitTransactionStellar(xdrTx: string): Promise<HorizonApi.SubmitTransactionResponse>;

  /**
   *
   * @param xdrTx
   */
  sendTransactionSoroban(xdrTx: string): Promise<SorobanRpc.Api.SendTransactionResponse>;

  /**
   *
   * @param hash
   * @param secondsToWait Optional. Default is 15s
   */
  confirmTx(hash: string, secondsToWait?: number): Promise<SorobanRpc.Api.GetTransactionResponse>;
}

export class UtilsService implements Utils {
  private readonly sorobanServer: SorobanRpc.Server;
  private readonly stellarServer: Horizon.Server;

  constructor(private rpcOptions: RpcOptions) {
    this.sorobanServer = new SorobanRpc.Server(rpcOptions.sorobanRpcUrl);
    this.stellarServer = new Horizon.Server(rpcOptions.stellarRpcUrl);
  }

  async submitTransactionStellar(xdrTx: string): Promise<HorizonApi.SubmitTransactionResponse> {
    const transaction = TransactionBuilder.fromXDR(xdrTx, this.rpcOptions.stellarRpcUrl);
    return await this.stellarServer.submitTransaction(transaction);
  }

  async sendTransactionSoroban(xdrTx: string): Promise<SorobanRpc.Api.SendTransactionResponse> {
    const transaction = TransactionBuilder.fromXDR(xdrTx, this.rpcOptions.sorobanNetworkPassphrase) as Transaction;
    return this.sorobanServer.sendTransaction(transaction);
  }

  async confirmTx(hash: string, secondsToWait = 15): Promise<SorobanRpc.Api.GetTransactionResponse> {
    const getTransactionResponseAll = await withExponentialBackoff(
      () => this.sorobanServer.getTransaction(hash),
      (resp) => resp.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND,
      secondsToWait,
    );
    return getTransactionResponseAll[getTransactionResponseAll.length - 1];
  }
}
