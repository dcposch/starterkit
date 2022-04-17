import { World } from ".";
import { Component, ComponentValue, Entity, HasQueryFragment, HasValueQueryFragment, NotQueryFragment, NotValueQueryFragment, Query, QueryFragments, Schema } from "./types";
export declare function Has<T extends Schema>(component: Component<T>): HasQueryFragment<T>;
export declare function Not<T extends Schema>(component: Component<T>): NotQueryFragment<T>;
export declare function HasValue<T extends Schema>(component: Component<T>, value: ComponentValue<T>): HasValueQueryFragment<T>;
export declare function NotValue<T extends Schema>(component: Component<T>, value: ComponentValue<T>): NotValueQueryFragment<T>;
export declare function defineQuery(fragments: QueryFragments): Query;
export declare function exists(fragments: QueryFragments): Entity | undefined;
/**
 * Return the entities that haven't been there before
 */
export declare function defineEnterQuery(world: World, fragments: QueryFragments, options?: {
    runOnInit?: boolean;
}): Query;
/**
 * Return the entities that have been there before but not anymore
 */
export declare function defineExitQuery(world: World, fragments: QueryFragments, options?: {
    runOnInit?: boolean;
}): Query;
/**
 * Return the entities whose components (in the query) have been updated
 */
export declare function defineUpdateQuery(world: World, fragments: QueryFragments, options?: {
    runOnInit?: boolean;
}): Query;
