import { BigNumber, Contract, PopulatedTransaction, Signer } from "ethers";
import { Mutex } from "async-mutex";

export function createTxExecutor<C extends Contract>(signer: Signer, contract: C, chainId: number) {
  const mutex = new Mutex();
  async function sendTx(
    genTx: (c: typeof contract["populateTransaction"]) => PopulatedTransaction | Promise<PopulatedTransaction>
  ) {
    await mutex.runExclusive(async () => {
      try {
        const txRequest = await genTx(contract.populateTransaction);
        txRequest.gasPrice = BigNumber.from(10 ** 4);
        txRequest.gasLimit = BigNumber.from(15_000_000);
        const isLocal = chainId === 31337;
        const request = await signer.sendTransaction({
          ...txRequest,
          gasPrice: isLocal ? 0 : txRequest.gasPrice,
          gasLimit: txRequest.gasLimit,
        });
        await request.wait(0);
      } catch (e) {
        console.warn("Tx failed:", e);
      }
    });
  }

  return { sendTx };
}
