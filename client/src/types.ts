import { createGame } from "./Game";

export type PromiseValue<T extends Promise<unknown>> = T extends Promise<infer V> ? V : never;
export type Context = PromiseValue<ReturnType<typeof createGame>>;

export type Coord = {
  x: number;
  y: number;
};
