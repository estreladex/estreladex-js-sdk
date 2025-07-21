import { EstrelaSdk } from '@estreladex/sdk';
import * as dotenv from 'dotenv';
import { ensure } from '../../utils/assertion';
import { getEnvVar } from '../../utils/env';
import { signAndSend } from '../../utils/sign-and-send';

dotenv.config({ path: '.env' });

const myAddress = getEnvVar('SRB_ACCOUNT_ADDRESS');
const privateKey = getEnvVar('SRB_PRIVATE_KEY');

const main = async () => {
  const sdk = await EstrelaSdk.create();
  const poolAddress = getEnvVar('SRB_POOL_ADDRESS');
  const token1 = getEnvVar('SRB_TOKEN1_ADDRESS');
  const token2 = getEnvVar('SRB_TOKEN2_ADDRESS');

  const pools = sdk.pool.getPools();
  const pool = ensure(pools.find((pool) => pool.address === poolAddress));

  const sourceToken = ensure(pool.tokens.find((token) => token.address === token1));
  const destToken = ensure(pool.tokens.find((token) => token.address === token2));

  const amount = '100';
  const amountToBeReceived = await sdk.pool.getAmountToBeReceived({
    amount: amount,
    poolAddress: pool.address,
    sourceToken: sourceToken,
    destToken: destToken,
  });
  console.log('amountToBeReceived:', amountToBeReceived);

  const amountToSend = await sdk.pool.getAmountToSend({
    expectedAmount: amountToBeReceived.receiveAmount,
    poolAddress: pool.address,
    sourceToken: sourceToken,
    destToken: destToken,
  });
  console.log('amountToSend:', amountToSend);

  const xdrTx = await sdk.pool.txBuilder.buildSwapTxXdr({
    sender: myAddress,
    recipient: myAddress,
    amount: amount,
    receiveAmountMin: amountToBeReceived.receiveAmount,
    poolAddress: pool.address,
    sourceToken: sourceToken,
    destToken: destToken,
  });

  //SignTx
  await signAndSend(privateKey, xdrTx, sdk);
};

main()
  .then(() => {
    console.log('Done');
  })
  .catch((e) => {
    console.error(e);
  });
