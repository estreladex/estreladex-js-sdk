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

  const pools = sdk.pool.getPools();
  const pool = ensure(pools.find((pool) => pool.address === poolAddress));

  const lpAmount = '100';
  const amountToBeWithdrawn = await sdk.pool.getAmountToBeWithdrawn({ poolAddress: pool.address, lpAmount: lpAmount });
  console.log('amountToBeWithdrawn', amountToBeWithdrawn);

  const xdrTx = await sdk.pool.txBuilder.buildWithdrawTxXdr({
    sender: myAddress,
    poolAddress: pool.address,
    lpAmount: lpAmount,
  });

  // SignTx
  await signAndSend(privateKey, xdrTx, sdk);
};

main()
  .then(() => {
    console.log('Done');
  })
  .catch((e) => {
    console.error(e);
  });
