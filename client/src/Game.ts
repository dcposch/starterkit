import { createWorld } from "@latticexyz/mobx-ecs";
import { createMapping, loadEvents, setupContracts, setupMappings } from "../packages/lattice-eth-middleware";
import { setupPhaser } from "@latticexyz/phaser-middleware";
import {
  createAddressComponent,
  createBoolComponent,
  createCoordComponent,
  createStringComponent,
  createTupleComponent,
  createUintComponent,
  decodeAddressComponent,
  decodeBoolComponent,
  decodeCoordComponent,
  decodeStringComponent,
  decodeTupleComponent,
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
  const OwnedBy = createAddressComponent(world, "OwnedBy");
  const Movable = createBoolComponent(world, "Movable");
  const Miner = createBoolComponent(world, "Miner");
  const Mined = createBoolComponent(world, "Mined");
  const Heart = createBoolComponent(world, "Heart");
  const Attack = createUintComponent(world, "Attack");
  const Life = createTupleComponent(world, "Life");

  const components = {
    Position,
    Texture,
    Appearance,
    OwnedBy,
    Movable,
    Miner,
    Mined,
    Heart,
    Attack,
    Life,
  };

  /*****************************************
   * Mapping contract to client components
   *****************************************/
  setupMappings(world, contracts.World, {
    ...createMapping(componentAddresses.position, Position, decodeCoordComponent),
    ...createMapping(componentAddresses.texture, Texture, decodeStringComponent),
    ...createMapping(componentAddresses.appearance, Appearance, decodeUintComponent),
    ...createMapping(componentAddresses.ownedBy, OwnedBy, decodeAddressComponent),
    ...createMapping(componentAddresses.movable, Movable, decodeBoolComponent),
    ...createMapping(componentAddresses.miner, Miner, decodeBoolComponent),
    ...createMapping(componentAddresses.mined, Mined, decodeBoolComponent),
    ...createMapping(componentAddresses.heart, Heart, decodeBoolComponent),
    ...createMapping(componentAddresses.attack, Attack, decodeUintComponent),
    ...createMapping(componentAddresses.life, Life, decodeTupleComponent),
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
