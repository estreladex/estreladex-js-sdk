import { ApiFetchError } from '../../exceptions';
import { AprResponse, SwapVolumeResponse, TotalsResponse } from './models';

export interface ApiService {
  getApr(): Promise<AprResponse>;

  getSwapVolume(): Promise<SwapVolumeResponse>;

  getTotals(): Promise<TotalsResponse>;
}

export class ApiServiceInstance implements ApiService {
  constructor(private readonly apiUrl: string) {}

  async getApr(): Promise<AprResponse> {
    const response = await fetch(`${this.apiUrl}/apr`);
    if (!response.ok) {
      throw new ApiFetchError('Failed to fetch APR data');
    }
    return response.json();
  }

  async getSwapVolume(): Promise<SwapVolumeResponse> {
    const response = await fetch(`${this.apiUrl}/swap-volume`);
    if (!response.ok) {
      throw new ApiFetchError('Failed to fetch swap volume');
    }
    return response.json();
  }

  async getTotals(): Promise<TotalsResponse> {
    const response = await fetch(`${this.apiUrl}/totals`);
    if (!response.ok) {
      throw new ApiFetchError('Failed to fetch totals data');
    }
    return response.json();
  }
}
