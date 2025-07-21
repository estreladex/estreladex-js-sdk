import { EstrelaSdk } from '@estreladex/sdk';
import * as dotenv from 'dotenv';
import { ensure } from '../../utils/assertion';
import { getEnvVar } from '../../utils/env';

dotenv.config({ path: '.env' });
const myAddress = getEnvVar('SRB_ACCOUNT_ADDRESS');

const main = async () => {
  const sdk = await EstrelaSdk.create();
  const poolAddress = getEnvVar('SRB_POOL_ADDRESS');

  const pools = sdk.pool.getPools();
  const pool = ensure(pools.find((pool) => pool.address === poolAddress));

  const pendingReward = await sdk.pool.getPendingReward({ user: myAddress, poolAddress: pool.address });
  console.log('pendingReward', pendingReward);

  const userDeposit = await sdk.pool.getUserDeposit({ user: myAddress, poolAddress: pool.address });
  console.log('userDeposit', userDeposit);
};

main()
  .then(() => {
    console.log('Done');
  })
  .catch((e) => {
    console.error(e);
  });
