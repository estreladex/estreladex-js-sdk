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

  const xdrTx = await sdk.pool.txBuilder.buildClaimRewardsTxXdr({
    sender: myAddress,
    poolAddress: pool.address,
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
