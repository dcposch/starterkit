import { WebSocketProvider } from "@ethersproject/providers";
import { Wallet, Contract } from "ethers";
import { Game as GameContract, World as WorldContract } from "@latticexyz/contracts";
import GameABI from "@latticexyz/contracts/dist/src/Game.sol/Game.json";
import WorldABI from "@latticexyz/contracts/dist/lattice-ecs/World.sol/World.json";
import { createTxExecutor } from "./createTxExecutor";
import { RpcProvider } from "./constants";

export async function setupContracts(contractAddress: string, privateKey: string, chainId: number) {
  if (!contractAddress || !privateKey) throw new Error("Can't connect to contracts");
  console.log("Setting up provider...");
  const provider = new WebSocketProvider(RpcProvider[chainId]);
  console.log("Setting up signer...");
  const signer = new Wallet(privateKey, provider);
  console.log("Signer address: ", signer.address);
  console.log("Setting up Game contract...");
  const Game = new Contract(contractAddress, GameABI.abi, signer) as GameContract;
  console.log("Game contract address: ", Game.address);
  console.log("Setting up World contract...");
  const World = new Contract(await Game.world(), WorldABI.abi, signer) as WorldContract;
  console.log("World contract address: ", World.address);
  const contracts = { Game, World };
  console.log("Setting up TxExecutor...");
  const txExecutor = createTxExecutor(signer, contracts.Game, chainId);
  return { provider, signer, contracts, txExecutor };
}
