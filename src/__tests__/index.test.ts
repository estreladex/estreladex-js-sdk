import { EstrelaSdk, RpcOptions, SdkParams } from '../index';
import { PoolServiceInstance } from '../services/pools/pool-service';
import { TokenServiceInstance } from '../services/tokens/token-service';
import { UtilsService } from '../services/utils-service';

jest.mock('../services/pools/pool-service');
jest.mock('../services/tokens/token-service');
jest.mock('../services/utils-service');

describe('Testing the EstrelaSdk class', () => {
  let sdk: EstrelaSdk;
  let rpcOptions: RpcOptions;
  let sdkParams: SdkParams;

  const poolServiceMock = {} as PoolServiceInstance;
  const poolServiceCreationMock = jest.fn().mockReturnValue(poolServiceMock);

  const initSdkParams = (sorobanRpcUrl: string, stellarRpcUrl: string) => {
    rpcOptions = {
      sorobanNetworkPassphrase: 'Test Network',
      sorobanRpcUrl,
      stellarRpcUrl,
    };
    sdkParams = {
      rpcOptions,
      initFactory: 'testFactory',
    };
  };

  beforeEach(async () => {
    initSdkParams('http://localhost:8080', 'http://localhost:3000');
    PoolServiceInstance.create = poolServiceCreationMock;
    sdk = await EstrelaSdk.create(sdkParams);
  });

  test('Get Token service', () => {
    expect(sdk.token).toBeInstanceOf(TokenServiceInstance);
  });

  test('Get Pool service', () => {
    expect(sdk.pool).toBe(poolServiceMock);
  });

  test('Get Utils service', () => {
    expect(sdk.utils).toBeInstanceOf(UtilsService);
  });

  test('Get rpcOptions', () => {
    expect(sdk.rpcOptions).toMatchObject(rpcOptions);
  });

  test('Set Rpc URLs', async () => {
    initSdkParams('http://newhost:8080', 'http://newhost:3000');
    await sdk.setRpcUrls(rpcOptions);

    expect(sdk.rpcOptions).toMatchObject(rpcOptions);
  });
});
