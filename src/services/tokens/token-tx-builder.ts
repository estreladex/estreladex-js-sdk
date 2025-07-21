import { Asset, Horizon, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { RpcOptions } from '../../index';
import { TrustLineParams } from './models';
import { TokenServiceInstance } from './token-service';

const FEE = 100;
const SEND_TRANSACTION_TIMEOUT = 180;

export interface TokenTxBuilder {
  /**
   * Returns XDR ChangeTrustLine transaction
   * @param params
   */
  buildChangeTrustLineXdrTx(params: TrustLineParams): Promise<string>;
}
export class TokenTxBuilderService implements TokenTxBuilder {
  private readonly stellarServer: Horizon.Server;
  constructor(
    private rpcOptions: RpcOptions,
    private tokenService: TokenServiceInstance,
  ) {
    this.stellarServer = new Horizon.Server(this.rpcOptions.stellarRpcUrl);
  }

  async buildChangeTrustLineXdrTx(params: TrustLineParams): Promise<string> {
    const stellarAccount = await this.stellarServer.loadAccount(params.sender);
    const token = await this.tokenService.getToken(params.tokenAddress);
    const asset = new Asset(token.symbol, token.srbAddress);

    const changeTrust = Operation.changeTrust({
      asset: asset,
      limit: params.limit,
    });

    return new TransactionBuilder(stellarAccount, {
      fee: FEE.toString(10),
      networkPassphrase: this.rpcOptions.sorobanNetworkPassphrase,
    })
      .addOperation(changeTrust)
      .setTimeout(SEND_TRANSACTION_TIMEOUT)
      .build()
      .toXDR();
  }
}
