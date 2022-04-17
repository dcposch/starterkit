/* eslint-disable @typescript-eslint/no-explicit-any */
import { getComponentValue, removeComponent, setComponent } from "@latticexyz/mobx-ecs";
import { createGame } from "./Game";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./react/App";
import { defaultAbiCoder as abi } from "ethers/lib/utils";

async function boot() {
  console.log("Booting phaser...");
  // URL params are passed by the Lattice Launcher
  const params = new URLSearchParams(window.location.search);
  const contractAddress = params.get("contractAddress");
  const privateKey = params.get("burnerWalletPrivateKey");
  const chainIdString = params.get("chainId");
  const personaIdString = params.get("personaId");
  if (!contractAddress || !privateKey || !chainIdString || !personaIdString) throw new Error("Invalid params");
  const game = await createGame(contractAddress, privateKey, parseInt(chainIdString), parseInt(personaIdString));

  // Expose the game context to the JavaScript console
  (window as any).game = game;

  console.log("Booting react...");
  const rootElement = document.getElementById("react-root");
  if (!rootElement) return console.warn("React root not found");
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App context={game} />);
}

boot();

// Expose some more useful functions to the JavaScript console
(window as any).utils = {
  setComponent,
  removeComponent,
  getComponentValue,
  encode: abi.encode.bind(abi),
};
