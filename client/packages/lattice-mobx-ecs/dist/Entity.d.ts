import { ComponentWithValue, Entity, Schema, Unpacked, World } from "./types";
export declare function createEntity<Cs extends Schema[]>(world: World, components?: ComponentWithValue<Unpacked<Cs>>[]): Entity;
