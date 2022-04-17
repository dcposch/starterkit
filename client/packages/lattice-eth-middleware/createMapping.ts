import { Component, ComponentValue, Schema } from "@latticexyz/mobx-ecs";
import { Mapping } from "./types";

/**
 * Type safe helper function to return a mapping from contract to client component
 * @param componentAddress Contract address of the contract component
 * @param component Client side component
 * @param decoder Function to decode raw bytes data into expected component schema
 * @returns Expected format for a mapping from contract to client component
 */
export function createMapping<T extends Schema>(
  componentAddress: string,
  component: Component<T>,
  decoder: (data: string) => ComponentValue<T>
): { [key: string]: Mapping<T> } {
  return { [componentAddress]: { componentAddress, component, decoder } };
}
