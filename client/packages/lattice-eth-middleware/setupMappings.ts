import { ComponentValueRemovedEvent, ComponentValueSetEvent } from "@latticexyz/contracts/dist/World";
import { removeComponent, setComponent, World } from "@latticexyz/mobx-ecs";
import { Contracts, Mappings } from "./types";

/**
 * Sets up syncronization between contract components and client components by listening to World contract events
 * @param world Client-side world of the network layer
 * @param worldContract Address of the world contract
 * @param mappings Mappings from component contract address to client side component
 */
export function setupMappings(world: World, worldContract: Contracts["World"], mappings: Mappings) {
  console.log("Setting up mappings...");
  worldContract.on<ComponentValueSetEvent>(worldContract.filters.ComponentValueSet(), (address, entityBigInt, data) => {
    const entity = entityBigInt.toNumber();
    const mapping = mappings[address];
    if (!mapping) {
      console.warn("Received ComponentValueSet event without mapping: ", address, entity, data, mappings);
      return;
    }

    const { component, decoder } = mapping;
    const value = decoder(data);

    if (!world.entities.has(entity)) {
      world.registerEntity(entity);
    }
    console.log("Setting", component.id, entity, value);
    setComponent(component, entity, value);
  });

  worldContract.on<ComponentValueRemovedEvent>(
    worldContract.filters.ComponentValueRemoved(),
    (address, entityBigInt) => {
      const entity = entityBigInt.toNumber();
      const mapping = mappings[address];
      if (!mapping) {
        console.warn("Received ComponentValueRemoved event without mapping: ", address, entity, mappings);
        return;
      }

      const { component } = mapping;

      removeComponent(component, entity);
    }
  );
}
