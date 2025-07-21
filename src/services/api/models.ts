export { ApiService } from './api-service';

export type AprResponse = Record<string, string>;

export interface SwapVolumeResponse {
  volume: string;
}

export interface TotalsResponse {
  volume: string;
  aprs: AprResponse[];
}
