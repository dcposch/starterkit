import { Component, ComponentValue, Entity, QueryFragments, Schema, World } from "./types";
export declare type System = () => void;
export declare function defineSystem(world: World, system: (world: World) => void): System;
/**
 * @param system Function to be called whenever any of the observable data accessed in the function changes
 * @returns Function to dispose the system
 */
export declare function defineAutorunSystem(world: World, system: () => void): void;
/**
 * @param observe System is rerun if any of the data accessed in this function changes. Result of this function is passed to the system.
 * @param system Function to be run when any of the data accessed in the observe function changes
 * @returns Function to dispose the system
 */
export declare function defineReactionSystem<T>(world: World, observe: () => T, system: (data: T) => void): void;
/**
 * @param query Component is added to all entites returned by the query
 * @param component Component to be added
 * @param value Component value to be added
 * @returns Function to dispose the system
 */
export declare function defineSyncSystem<T extends Schema>(world: World, query: QueryFragments, component: (entity: Entity) => Component<T>, value: (entity: Entity) => ComponentValue<T>): void;
