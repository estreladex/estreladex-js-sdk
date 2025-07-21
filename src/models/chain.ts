/* eslint-disable sort-exports/sort-exports */

export interface BasicChainProperties {
  chainSymbol: ChainSymbol;
  name: string;
  decimals: number;
}

/**
 * Contains blockchain's basic information
 */
export enum ChainSymbol {
  /**
   * The Soroban network.
   */
  SRB = 'SRB',

  /**
   * The Stellar network.
   */
  STLR = 'STLR',
}

export const chainProperties: Record<string, BasicChainProperties> = {
  [ChainSymbol.SRB]: {
    chainSymbol: ChainSymbol.SRB,
    name: 'Soroban',
    decimals: 7,
  },
  [ChainSymbol.STLR]: {
    chainSymbol: ChainSymbol.STLR,
    name: 'Stellar',
    decimals: 7,
  },
};
