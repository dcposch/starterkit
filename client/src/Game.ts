import { createWorld } from "@latticexyz/mobx-ecs";
import { createMapping, loadEvents, setupContracts, setupMappings } from "../packages/lattice-eth-middleware";
import { setupPhaser } from "@latticexyz/phaser-middleware";
import {
  createCoordComponent,
  createStringComponent,
  createUintComponent,
  decodeCoordComponent,
  decodeStringComponent,
  decodeUintComponent,
} from "./components";
import { createPositionSystem } from "./systems/PositionSystem";
import { createTextureSystem } from "./systems/TextureSystem";
import { createAppearanceSystem } from "./systems/AppearanceSystem";

export async function createGame(contractAddress: string, privateKey: string, chainId: number, personaId: number) {
  const world = createWorld();

  /*****************************************
   * Contract setup
   *****************************************/
  const { contracts, txExecutor, provider, signer } = await setupContracts(contractAddress, privateKey, chainId);
  const componentAddresses = await contracts.Game.c();

  /*****************************************
   * Phaser setup
   *****************************************/
  const width = (await contracts.Game.width()).toNumber();
  const height = (await contracts.Game.height()).toNumber();
  const phaser = await setupPhaser(width, height);

  /*****************************************
   * Component definitions
   *****************************************/
  const Position = createCoordComponent(world, "Position");
  const Texture = createStringComponent(world, "Texture");
  const Appearance = createUintComponent(world, "Appearance");

  const components = {
    Position,
    Texture,
    Appearance,
  };

  /*****************************************
   * Mapping contract to client components
   *****************************************/
  setupMappings(world, contracts.World, {
    ...createMapping(componentAddresses.position, Position, decodeCoordComponent),
    ...createMapping(componentAddresses.texture, Texture, decodeStringComponent),
    ...createMapping(componentAddresses.appearance, Appearance, decodeUintComponent),
  });
  await loadEvents(provider, contracts.World);

  /*****************************************
   * Methods and context for consumers
   *****************************************/
  function ping() {
    return "pong";
  }

  const context = {
    world,
    phaser,
    contracts,
    components,
    signer,
    txExecutor,
    personaId,
    api: { ping },
  };

  /*****************************************
   * Systems
   *****************************************/
  createPositionSystem(context);
  createTextureSystem(context);
  createAppearanceSystem(context);

  return context;
}
