import { AnyComponent, Entity, World } from "./types";
export declare function createWorld(options?: {
    parentWorld?: World;
}): World;
export declare function extendWorld(parentWorld: World): World;
export declare function getEntityComponents(world: World, entity: Entity): Set<AnyComponent>;
