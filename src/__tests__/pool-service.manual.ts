import { AmountToBeWithdrawnParams, AmountToSendParams, EstrelaSdk, LiquidityPool, Token } from '../index';

describe.each([2, 3])('PoolService with pools tokens = %i', (tokenCount) => {
  let sdk: EstrelaSdk;

  let pool: LiquidityPool;
  let sourceToken: Token;
  let destToken: Token;

  const destTokenIndex = tokenCount - 1;

  beforeAll(async () => {
    sdk = await EstrelaSdk.create();

    const pools = await sdk.pool.getPools();
    const found = pools.find((p) => p.tokens.length === tokenCount);
    if (!found) {
      throw new Error(`No pool found with ${tokenCount} tokens`);
    }
    pool = found;
    console.log('Pool=', JSON.stringify(await sdk.pool.getPoolSnapshot(pool.address), null, 2));

    sourceToken = pool.tokens[0];
    destToken = pool.tokens[destTokenIndex];
  });

  it('🌞 getAmountToBeReceived should return equal from local and contract', async () => {
    const amount = '10123456789.111199';
    const params = {
      amount,
      poolAddress: pool.address,
      sourceToken,
      destToken,
    };
    const result1 = await sdk.pool.getAmountToBeReceived(params, 'local');
    const result2 = await sdk.pool.getAmountToBeReceived(params, 'contract');
    expect(result1).toEqual(result2);
  });

  describe('getAmountToSend', () => {
    it('🌞 should return equal from local and contract', async () => {
      const amount = '107.111199';
      const params = {
        expectedAmount: amount,
        poolAddress: pool.address,
        sourceToken,
        destToken,
      };
      const result1 = await sdk.pool.getAmountToSend(params, 'local');
      const result2 = await sdk.pool.getAmountToSend(params, 'contract');
      expect(result1).toEqual(result2);
    });

    describe('amount too big', () => {
      const amount = '110030000000000.111199';

      let params: AmountToSendParams;
      beforeAll(() => {
        params = {
          expectedAmount: amount,
          poolAddress: pool.address,
          sourceToken,
          destToken,
        };
      });

      it('🌞 "local" should return zero', async () => {
        const result1 = await sdk.pool.getAmountToSend(params, 'local');
        expect(result1.amount).toEqual('0');
      });

      it('🔴 "contract" should throw simulation error', async () => {
        try {
          await sdk.pool.getAmountToSend(params, 'contract');
          fail('Expected error was not thrown');
          // @ts-expect-error all ok
        } catch (error: Error) {
          expect(error.message).toContain('Transaction simulation failed');
          expect(error.message).toContain('get_send_amount');
        }
      });
    });
  });

  it('🌞 getAmountToBeDeposited should return equal from local and contract', async () => {
    const amount1 = '10.111111';
    const amount2 = '1000000000.22222';
    const tokenAmounts: string[] = new Array(tokenCount).fill('0');
    tokenAmounts[0] = amount1;
    tokenAmounts[destTokenIndex] = amount2;
    const params = {
      poolAddress: pool.address,
      tokenAmounts,
    };
    const result1 = await sdk.pool.getAmountToBeDeposited(params, 'local');
    const result2 = await sdk.pool.getAmountToBeDeposited(params, 'contract');
    expect(result1).toEqual(result2);
  });

  describe('getAmountToBeWithdrawn', () => {
    it('🌞 should return equal from local and contract', async () => {
      const amount = '100.123';
      const params = {
        poolAddress: pool.address,
        lpAmount: amount,
      };
      const result1 = await sdk.pool.getAmountToBeWithdrawn(params, 'local');
      console.log('res1', result1);
      const result2 = await sdk.pool.getAmountToBeWithdrawn(params, 'contract');
      expect(result1).toEqual(result2);
    });

    describe('amount too big', () => {
      const amount = '110030000000000.111';

      let params: AmountToBeWithdrawnParams;
      beforeAll(() => {
        params = {
          poolAddress: pool.address,
          lpAmount: amount,
        };
      });

      it('🌞 "local" should return zero', async () => {
        const result1 = await sdk.pool.getAmountToBeWithdrawn(params, 'local');
        expect(result1.tokenAmounts).toEqual(new Array(tokenCount).fill('0'));
        expect(result1.tokenFees).toEqual(new Array(tokenCount).fill('0'));
      });

      it('🔴 "contract" should throw simulation error', async () => {
        try {
          await sdk.pool.getAmountToBeWithdrawn(params, 'contract');
          fail('Expected error was not thrown');
          // @ts-expect-error all ok
        } catch (error: Error) {
          expect(error.message).toContain('Transaction simulation failed');
          expect(error.message).toContain('get_withdraw_amount');
        }
      });
    });
  });
});
