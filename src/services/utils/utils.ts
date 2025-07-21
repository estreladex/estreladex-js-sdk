import { contract } from '@stellar/stellar-sdk';
import { RpcOptions } from '../../index';

import ContractClientOptions = contract.ClientOptions;

export function getContract<T>(
  contract: new (args: ContractClientOptions) => T,
  address: string,
  params: RpcOptions,
  sender?: string,
): T {
  const config: ContractClientOptions = {
    publicKey: sender,
    contractId: address,
    networkPassphrase: params.sorobanNetworkPassphrase,
    rpcUrl: params.sorobanRpcUrl,
  };
  return new contract(config);
}

/**
 * Keep calling a `fn` for `secondsToWait` seconds, if `keepWaitingIf` is true.
 * Returns an array of all attempts to call the function.
 */
export async function withExponentialBackoff<T>(
  fn: (previousFailure?: T) => Promise<T>,
  keepWaitingIf: (result: T) => boolean,
  secondsToWait: number,
  exponentialFactor = 1.5,
  verbose = false,
): Promise<T[]> {
  const attempts: T[] = [];

  let count = 0;
  attempts.push(await fn());
  if (!keepWaitingIf(attempts[attempts.length - 1])) return attempts;

  const waitUntil = new Date(Date.now() + secondsToWait * 1000).valueOf();
  let waitTime = 1000;
  let totalWaitTime = waitTime;

  while (Date.now() < waitUntil && keepWaitingIf(attempts[attempts.length - 1])) {
    count++;
    // Wait a beat
    if (verbose) {
      console.info(
        `Waiting ${waitTime}ms before trying again (bringing the total wait time to ${totalWaitTime}ms so far, of total ${
          secondsToWait * 1000
        }ms)`,
      );
    }
    await new Promise((res) => setTimeout(res, waitTime));
    // Exponential backoff
    waitTime = waitTime * exponentialFactor;
    if (new Date(Date.now() + waitTime).valueOf() > waitUntil) {
      waitTime = waitUntil - Date.now();
      if (verbose) {
        console.info(`was gonna wait too long; new waitTime: ${waitTime}ms`);
      }
    }
    totalWaitTime = waitTime + totalWaitTime;
    // Try again
    attempts.push(await fn(attempts[attempts.length - 1]));
    if (verbose && keepWaitingIf(attempts[attempts.length - 1])) {
      console.info(
        `${count}. Called ${fn.name}; ${attempts.length} prev attempts. Most recent: ${JSON.stringify(
          attempts[attempts.length - 1],
          null,
          2,
        )}`,
      );
    }
  }

  return attempts;
}
