import {
  createWorld,
  Entity,
  exists,
  getComponentValue,
  Has,
  removeComponent,
  setComponent,
} from "@latticexyz/mobx-ecs";
import { createMapping, loadEvents, setupContracts, setupMappings } from "../packages/lattice-eth-middleware";
import { setupPhaser } from "@latticexyz/phaser-middleware";
import {
  createBoolComponent,
  createCoordComponent,
  createStringComponent,
  createTupleComponent,
  createUintComponent,
  decodeBoolComponent,
  decodeCoordComponent,
  decodeStringComponent,
  decodeTupleComponent,
  decodeUintComponent,
} from "./components";
import { createPositionSystem } from "./systems/PositionSystem";
import { createTextureSystem } from "./systems/TextureSystem";
import { createAppearanceSystem } from "./systems/AppearanceSystem";
import { Coord } from "./types";
import { createInputSystem } from "./systems/InputSystem";
import { Directions } from "./constants";
import { createLifeSystem } from "./systems/LifeSystem";
import { createParticleSystem } from "./systems/ParticleSystem";
import { createOwnedBySystem } from "./systems/OwnedBySystem";
import { createSelectedSystem } from "./systems/SelectedSystem";

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
  const OwnedBy = createUintComponent(world, "OwnedBy");
  const Movable = createBoolComponent(world, "Movable");
  const Miner = createBoolComponent(world, "Miner");
  const Mined = createBoolComponent(world, "Mined");
  const Heart = createBoolComponent(world, "Heart");
  const Attack = createUintComponent(world, "Attack");
  const Life = createTupleComponent(world, "Life");
  const Selected = createBoolComponent(world, "Selected");
  const PendingAction = createCoordComponent(world, "PendingAction");

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
    Selected,
    PendingAction,
  };

  /*****************************************
   * Mapping contract to client components
   *****************************************/
  setupMappings(world, contracts.World, {
    ...createMapping(componentAddresses.position, Position, decodeCoordComponent),
    ...createMapping(componentAddresses.texture, Texture, decodeStringComponent),
    ...createMapping(componentAddresses.appearance, Appearance, decodeUintComponent),
    ...createMapping(componentAddresses.ownedBy, OwnedBy, decodeUintComponent),
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
  function spawn(coord: Coord) {
    txExecutor.sendTx((c) => c.spawn(coord));
  }

  async function action(entity: Entity, target: Coord) {
    // Don't act if an action is pending
    const pendingAction = exists([Has(PendingAction)]);
    if (pendingAction != undefined) {
      console.warn("Action in progress");
      return;
    }

    // Add an action indicator
    setComponent(PendingAction, entity, target);

    // Execute the action
    await txExecutor.sendTx((contract) => contract.action(entity, target));

    // Remove the action indicator
    removeComponent(PendingAction, entity);
  }
  function actionDirection(direction: keyof typeof Directions) {
    // Get the currently selected entity
    const selected = exists([Has(Selected)]);
    if (selected == undefined) {
      console.warn("No entity selected");
      return;
    }

    // Get the currently selected entity's position
    const currentPosition = getComponentValue(Position, selected);
    if (!currentPosition) {
      console.warn("Entity has no position");
      return;
    }

    // Execute an action at the coord in the given direction
    const delta = Directions[direction];
    const newPosition = { x: currentPosition.x + delta.x, y: currentPosition.y + delta.y };
    action(selected, newPosition);
  }

  const context = {
    world,
    phaser,
    contracts,
    components,
    signer,
    txExecutor,
    personaId,
    api: { spawn, action, actionDirection },
  };

  /*****************************************
   * Systems
   *****************************************/
  createPositionSystem(context);
  createTextureSystem(context);
  createAppearanceSystem(context);
  createInputSystem(context);
  createLifeSystem(context);
  createParticleSystem(context);
  createOwnedBySystem(context);
  createSelectedSystem(context);

  return context;
}
