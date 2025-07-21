import { EstrelaSdk } from '@estreladex/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const main = async () => {
  const sdk = await EstrelaSdk.create();

  const apr = await sdk.api.getApr();
  console.log('apr=', JSON.stringify(apr, null, 2));

  const swapVolume = await sdk.api.getSwapVolume();
  console.log('swapVolume=', JSON.stringify(swapVolume, null, 2));

  const totals = await sdk.api.getTotals();
  console.log('totals=', JSON.stringify(totals, null, 2));
};

main()
  .then(() => {
    console.log('Done');
  })
  .catch((e) => {
    console.error(e);
  });
