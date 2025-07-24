import { ApiFetchError } from '../../exceptions';
import { VERSION } from '../../version';
import { Cached } from '../utils/cache.service';
import { AprResponse, SwapVolumeResponse, TotalsResponse } from './models';

export interface ApiService {
  getApr(): Promise<AprResponse>;

  getSwapVolume(): Promise<SwapVolumeResponse>;

  getTotals(): Promise<TotalsResponse>;
}

export class ApiServiceInstance implements ApiService {
  private readonly headers: Headers;

  constructor(private readonly apiUrl: string) {
    this.headers = new Headers();
    this.headers.set('x-sdk-agent', 'estrela-sdk/' + VERSION);
  }

  @Cached({ ttlSec: 55, lazy: { expireSec: 300 } }, () => 'api_apr')
  async getApr(): Promise<AprResponse> {
    const response = await fetch(`${this.apiUrl}/apr`, { headers: this.headers });
    if (!response.ok) {
      throw new ApiFetchError('Failed to fetch APR data');
    }
    return response.json();
  }

  @Cached({ ttlSec: 55, lazy: { expireSec: 300 } }, () => 'api_swap-volume')
  async getSwapVolume(): Promise<SwapVolumeResponse> {
    const response = await fetch(`${this.apiUrl}/swap-volume`, { headers: this.headers });
    if (!response.ok) {
      throw new ApiFetchError('Failed to fetch swap volume');
    }
    return response.json();
  }

  @Cached({ ttlSec: 55, lazy: { expireSec: 300 } }, () => 'api_totals')
  async getTotals(): Promise<TotalsResponse> {
    const response = await fetch(`${this.apiUrl}/totals`, { headers: this.headers });
    if (!response.ok) {
      throw new ApiFetchError('Failed to fetch totals data');
    }
    return response.json();
  }
}
