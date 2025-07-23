import { EstrelaSdk } from '@estreladex/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const main = async () => {
  const sdk = await EstrelaSdk.create();

  const pools = sdk.pool.getPools();
  console.log('pools=', JSON.stringify(pools, null, 2));

  const poolsSnapshot = await sdk.pool.getPoolsSnapshot();
  console.log('poolsSnapshot=', JSON.stringify(poolsSnapshot, null, 2));

  const tokens = sdk.token.getTokens();
  console.log('tokens=', JSON.stringify(tokens, null, 2));
};

main()
  .then(() => {
    console.log('Done');
  })
  .catch((e) => {
    console.error(e);
  });
