import { BaseProvider } from "@ethersproject/providers";
import { Contracts } from "./types";

export async function loadEvents(provider: BaseProvider, worldContract: Contracts["World"]) {
  console.log("Loading events...");

  const componentValueSet = await provider.getLogs({
    fromBlock: 0,
    topics: worldContract.filters.ComponentValueSet().topics,
  });

  for (const log of componentValueSet) {
    const parsedLog = worldContract.interface.parseLog(log);
    worldContract.emit(worldContract.filters.ComponentValueSet(), ...parsedLog.args);
  }

  const componentValueRemoved = await provider.getLogs({
    fromBlock: 0,
    topics: worldContract.filters.ComponentValueRemoved().topics,
  });

  for (const log of componentValueRemoved) {
    const parsedLog = worldContract.interface.parseLog(log);
    worldContract.emit(worldContract.filters.ComponentValueRemoved(), ...parsedLog.args);
  }

  console.log("Done loading events");
}
