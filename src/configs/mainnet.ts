import { Networks } from '@stellar/stellar-sdk';
import { RpcOptions } from '../index';

export const mainnetApiUrl = 'https://api.estreladex.com';

export const mainnetFactory = 'CDJOD3UVHJE3TZDZNLVYU55CSP2RSEHYR4GR6KF6SMA57IACASTRNS4U';

export const mainnetRpc: RpcOptions = {
  sorobanNetworkPassphrase: Networks.PUBLIC,
  sorobanRpcUrl: 'https://mainnet.sorobanrpc.com',
  stellarRpcUrl: 'https://horizon.stellar.org',
};
