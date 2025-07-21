import { Horizon } from '@stellar/stellar-sdk';
import { HorizonApi } from '@stellar/stellar-sdk/lib/horizon';
import BigNumber from 'bignumber.js';
import { BalanceLineParams, RpcOptions, Token } from '../../index';
import { TokenContract } from '../models/generated/token-contract';
import { getContract } from '../utils/utils';
import { TokenTxBuilder, TokenTxBuilderService } from './token-tx-builder';

export interface TokenService {
  get txBuilder(): TokenTxBuilder;

  getToken(address: string): Promise<Token>;

  getTokens(): Token[];

  getNativeTokenBalance(params: { account: string }): Promise<string>;

  getBalanceLine(params: BalanceLineParams): Promise<HorizonApi.BalanceLineAsset | undefined>;
}

export class TokenServiceInstance implements TokenService {
  readonly txBuilder: TokenTxBuilder;
  private readonly stellarServer: Horizon.Server;
  private tokenMap: Map<string, Token> = new Map<string, Token>();

  constructor(private rpcOptions: RpcOptions) {
    this.txBuilder = new TokenTxBuilderService(rpcOptions, this);
    this.stellarServer = new Horizon.Server(this.rpcOptions.stellarRpcUrl);
  }

  async getToken(address: string): Promise<Token> {
    if (this.tokenMap.has(address)) {
      return this.tokenMap.get(address)!;
    } else {
      return this.loadToken(address);
    }
  }

  private async loadToken(address: string): Promise<Token> {
    const { symbol, srbTokenAddress } = await this.getTokenDetails(address);

    const token: Token = {
      address: address,
      symbol: symbol,
      srbAddress: srbTokenAddress,
      decimals: 7,
    };
    this.tokenMap.set(address, token);
    return token;
  }

  getTokens(): Token[] {
    return Array.from(this.tokenMap.values());
  }

  async getNativeTokenBalance(params: { account: string }): Promise<string> {
    const stellarAccount = await this.stellarServer.loadAccount(params.account);
    const balances = stellarAccount.balances;

    const nativeBalance = balances.find(
      (balance): balance is HorizonApi.BalanceLineNative => balance.asset_type === 'native',
    );
    if (nativeBalance?.balance) {
      return BigNumber(nativeBalance?.balance).toFixed();
    }
    return '0';
  }

  async getBalanceLine(params: BalanceLineParams): Promise<HorizonApi.BalanceLineAsset | undefined> {
    let symbol: string;
    let srbTokenAddress: string;

    if (this.tokenMap.has(params.tokenAddress)) {
      const token = this.tokenMap.get(params.tokenAddress)!;
      symbol = token.symbol;
      srbTokenAddress = token.srbAddress;
    } else {
      const { symbol: _symbol, srbTokenAddress: _srbTokenAddress } = await this.getTokenDetails(params.tokenAddress);
      symbol = _symbol;
      srbTokenAddress = _srbTokenAddress;
    }

    const stellarAccount = await this.stellarServer.loadAccount(params.account);
    const balanceInfo = stellarAccount.balances;

    return balanceInfo.find(
      (balance): balance is HorizonApi.BalanceLineAsset =>
        (balance.asset_type === 'credit_alphanum4' || balance.asset_type === 'credit_alphanum12') &&
        balance.asset_code === symbol &&
        balance.asset_issuer === srbTokenAddress,
    );
  }

  private async getTokenDetails(address: string): Promise<{
    tokenName: string;
    symbol: string;
    srbTokenAddress: string;
  }> {
    const tokenContract = getContract(TokenContract, address, this.rpcOptions);
    const tokenName = (await tokenContract.name()).result;
    const [symbol, srbTokenAddress] = tokenName.split(':');
    return { tokenName, symbol, srbTokenAddress };
  }
}
