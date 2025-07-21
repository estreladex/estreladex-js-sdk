import { EstrelaSdk, mainnetRpc } from '@estreladex/sdk';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';
import * as dotenv from 'dotenv';
import { getEnvVar } from '../utils/env';

dotenv.config({ path: '.env' });

const myAddress = getEnvVar('SRB_ACCOUNT_ADDRESS');
const privateKey = getEnvVar('SRB_PRIVATE_KEY');

const main = async () => {
  const sdk = await EstrelaSdk.create();
  const token1 = getEnvVar('SRB_TOKEN1_ADDRESS');
  const token2 = getEnvVar('SRB_TOKEN2_ADDRESS');
  const token3 = getEnvVar('SRB_TOKEN3_ADDRESS');

  const nativeTokenBalance = await sdk.token.getNativeTokenBalance({ account: myAddress });
  console.log('nativeBalance=', JSON.stringify(nativeTokenBalance, null, 2));

  const balance1Line = await sdk.token.getBalanceLine({ account: myAddress, tokenAddress: token1 });
  console.log('token1BalanceLine=', balance1Line);
  const balance2Line = await sdk.token.getBalanceLine({ account: myAddress, tokenAddress: token2 });
  console.log('token2BalanceLine=', balance2Line);
  const balance3Line = await sdk.token.getBalanceLine({ account: myAddress, tokenAddress: token3 });
  console.log('token3BalanceLine=', balance3Line);

  if (!balance1Line) {
    console.log('noBalanceLine for token1, try to create...');
    await createTrustline(token1, sdk);
  }
  if (!balance2Line) {
    console.log('noBalanceLine for token2, try to create...');
    await createTrustline(token2, sdk);
  }
  if (!balance3Line) {
    console.log('noBalanceLine for token3, try to create...');
    await createTrustline(token3, sdk);
  }
};

async function createTrustline(tokenAddress: string, sdk: EstrelaSdk) {
  const xdrTx = await sdk.token.txBuilder.buildChangeTrustLineXdrTx({
    sender: myAddress,
    tokenAddress: tokenAddress,
  });

  //SignTx
  const keypair = Keypair.fromSecret(privateKey);
  const transaction = TransactionBuilder.fromXDR(xdrTx, mainnetRpc.sorobanNetworkPassphrase);
  transaction.sign(keypair);
  const signedTrustLineTx = transaction.toXDR();

  const submit = await sdk.utils.submitTransactionStellar(signedTrustLineTx);
  console.log('Submitted change trust tx. Hash:', submit.hash);
}

main()
  .then(() => {
    console.log('Done');
  })
  .catch((e) => {
    console.error(e);
  });
