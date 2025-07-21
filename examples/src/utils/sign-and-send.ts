import { EstrelaSdk } from '@estreladex/sdk';
import { Keypair, rpc as SorobanRpc, TransactionBuilder } from '@stellar/stellar-sdk';

export async function signAndSend(privateKey: string, xdrTx: string, sdk: EstrelaSdk) {
  try {
    const keypair = Keypair.fromSecret(privateKey);
    const transaction = TransactionBuilder.fromXDR(xdrTx, sdk.rpcOptions.sorobanNetworkPassphrase);
    transaction.sign(keypair);
    const signedTrustLineTx = transaction.toXDR();
    console.log('Tx signed');

    console.log('Submitting tx...');
    const sendResponse = await sdk.utils.sendTransactionSoroban(signedTrustLineTx);
    console.log('Sent Response:', JSON.stringify(sendResponse, undefined, 2));
    if (sendResponse.status === 'PENDING') {
      console.log(`Confirming tx...`);
      const confirm = await sdk.utils.confirmTx(sendResponse.hash, 30);
      if (confirm.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
        console.log(
          `Waited for transaction to complete, but it did not. ` +
            `Check the transaction status manually. ` +
            `Hash: ${sendResponse.hash}`,
        );
      } else if (confirm.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
        console.log(`Transaction failed. Check the transaction manually.` + `Hash: ${sendResponse.hash}`);
      } else {
        console.log(`Transaction Confirmed. Hash: ${sendResponse.hash}`);
      }
    } else {
      throw sendResponse.errorResult;
    }
  } catch (err) {
    // Catch and report any errors we've thrown
    console.log('Sending transaction failed');
    console.log(JSON.stringify(err));
  }
}
