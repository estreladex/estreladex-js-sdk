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

  const token1Amount = '0';
  const token2Amount = '100';
  const tokenAmounts = [token1Amount, token2Amount];
  if (pool.tokens.length === 3) {
    tokenAmounts.push('0');
  }

  const minLpAmount = await sdk.pool.getAmountToBeDeposited({
    poolAddress: pool.address,
    tokenAmounts: tokenAmounts,
  });
  console.log('minLpAmount:', minLpAmount);

  const xdrTx = await sdk.pool.txBuilder.buildDepositTxXdr({
    sender: myAddress,
    poolAddress: pool.address,
    tokenAmounts: tokenAmounts,
    minLpAmount: minLpAmount.lpAmount,
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
