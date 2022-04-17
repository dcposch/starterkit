import { Component, ComponentValue, Schema } from "@latticexyz/mobx-ecs";
import { setupContracts } from "./setupContracts";

export type PromiseValue<T extends Promise<unknown>> = T extends Promise<infer V> ? V : never;
export type Contracts = NonNullable<PromiseValue<ReturnType<typeof setupContracts>>["contracts"]>;

export type Mapping<T extends Schema> = {
  componentAddress: string;
  decoder: (data: string) => ComponentValue<T>;
  component: Component<T>;
};

export type Mappings = {
  [componentAddress: string]: Mapping<Schema>;
};
