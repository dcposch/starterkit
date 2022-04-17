import { reaction, runInAction } from "mobx";
import { defineComponent, removeComponent, setComponent, withValue } from "../src/Component";
import { createEntity } from "../src/Entity";
import { Has, Not, defineQuery, defineEnterQuery, defineExitQuery, defineUpdateQuery, HasValue } from "../src/Query";
import { Component, Type, World } from "../src/types";
import { createWorld } from "../src/World";

describe("Query", () => {
  let world: World;

  let Position: Component<{
    x: Type.Number;
    y: Type.Number;
  }>;

  let CanMove: Component<Record<string, never>>;

  beforeEach(() => {
    world = createWorld();

    Position = defineComponent(world, { x: Type.Number, y: Type.Number });
    CanMove = defineComponent(world, {});
  });

  describe("defineQuery", () => {
    it("should return all entities with Position and CanMove component", () => {
      const Creature1 = createEntity(world, [withValue(Position, { x: 1, y: 2 }), withValue(CanMove, {})]);
      const Creature2 = createEntity(world, [withValue(Position, { x: 1, y: 1 }), withValue(CanMove, {})]);
      const Structure = createEntity(world, [withValue(Position, { x: 2, y: 3 })]);

      const movableEntityQuery = defineQuery([Has(CanMove), Has(Position)]);
      const staticEntityQuery = defineQuery([Has(Position), Not(CanMove)]);

      const movableEntities = movableEntityQuery.get();
      const staticEntities = staticEntityQuery.get();

      expect(movableEntities).toEqual(new Set([Creature1, Creature2]));
      expect(movableEntities.has(Structure)).toBe(false);

      expect(staticEntities).toEqual(new Set([Structure]));
    });

    it("Should return all entities with the given values for the Position comppnent", () => {
      const Creature1 = createEntity(world, [withValue(Position, { x: 1, y: 2 }), withValue(CanMove, {})]);
      const Creature2 = createEntity(world, [withValue(Position, { x: 1, y: 1 }), withValue(CanMove, {})]);
      const Creature3 = createEntity(world, [withValue(Position, { x: 1, y: 1 })]);

      const valueQuery1 = defineQuery([HasValue(Position, { x: 1, y: 1 })]);
      expect(valueQuery1.get()).toEqual(new Set([Creature2, Creature3]));

      const valueQuery2 = defineQuery([Has(CanMove), HasValue(Position, { x: 1, y: 1 })]);
      expect(valueQuery2.get()).toEqual(new Set([Creature2]));

      const valueQuery3 = defineQuery([Has(CanMove), HasValue(Position, { x: 1, y: 2 })]);
      expect(valueQuery3.get()).toEqual(new Set([Creature1]));
    });

    it("should be observable", () => {
      let queryRanTimes = 0;
      let valueQueryRanTimes = 0;
      const entity = createEntity(world);
      const query = defineQuery([Has(Position)]);
      const valueQuery = defineQuery([HasValue(Position, { x: 2, y: 2 })]);

      reaction(
        () => query.get(),
        () => {
          queryRanTimes++;
        }
      );

      reaction(
        () => valueQuery.get(),
        () => {
          valueQueryRanTimes++;
        }
      );

      setComponent(Position, entity, { x: 2, y: 3 });
      expect(queryRanTimes).toBe(1);
      expect(valueQueryRanTimes).toBe(1);

      setComponent(Position, entity, { x: 2, y: 2 });
      expect(queryRanTimes).toBe(1);
      expect(valueQueryRanTimes).toBe(2);

      removeComponent(Position, entity);
      expect(queryRanTimes).toBe(2);
      expect(valueQueryRanTimes).toBe(3);
    });
  });

  describe("defineEnterQuery", () => {
    it("should only return newly added entities", () => {
      const enterQuery = defineEnterQuery(world, [Has(CanMove)]);
      const entities: string[] = [];
      runInAction(() => {
        entities.push(createEntity(world, [withValue(CanMove, {})]));
        entities.push(createEntity(world, [withValue(CanMove, {})]));
      });
      const entity3 = createEntity(world);

      expect(enterQuery.get()).toEqual(new Set(entities));

      setComponent(CanMove, entity3, {});
      expect(enterQuery.get()).toEqual(new Set([entity3]));
    });
  });

  describe("defineExitQuery", () => {
    it("should only return removed entities", () => {
      const exitQuery = defineExitQuery(world, [Has(CanMove)]);
      const entity1 = createEntity(world, [withValue(CanMove, {})]);
      const entity2 = createEntity(world);
      setComponent(CanMove, entity2, {});

      expect(exitQuery.get()).toEqual(new Set([]));

      removeComponent(CanMove, entity1);
      expect(exitQuery.get()).toEqual(new Set([entity1]));

      removeComponent(CanMove, entity2);
      expect(exitQuery.get()).toEqual(new Set([entity2]));
    });
  });

  describe("defineUpdateQuery", () => {
    it("should only return the last updated entity", () => {
      const updateQuery = defineUpdateQuery(world, [Has(Position)]);
      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      const entity2 = createEntity(world, [withValue(Position, { x: 1, y: 3 })]);

      expect(updateQuery.get()).toEqual(new Set([entity2]));
      // Should return this entity until the next one is updated
      expect(updateQuery.get()).toEqual(new Set([entity2]));

      setComponent(Position, entity1, { x: 2, y: 3 });
      expect(updateQuery.get()).toEqual(new Set([entity1]));
    });

    it("should not return entities matching the query before the query was defined", () => {
      createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      const updateQuery = defineUpdateQuery(world, [Has(Position)]);
      expect(updateQuery.get()).toEqual(new Set([]));

      const entity2 = createEntity(world, [withValue(Position, { x: 1, y: 3 })]);
      expect(updateQuery.get()).toEqual(new Set([entity2]));
    });

    it("should return entities matching the query before the query was defined if runOnInit is true", () => {
      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 })]);
      const entity2 = createEntity(world, [withValue(Position, { x: 4, y: 2 })]);
      const updateQuery = defineUpdateQuery(world, [Has(Position)], { runOnInit: true });
      expect(updateQuery.get()).toEqual(new Set([entity1, entity2]));

      const entity3 = createEntity(world, [withValue(Position, { x: 1, y: 3 })]);
      expect(updateQuery.get()).toEqual(new Set([entity3]));
    });

    it("should work with queries including multiple components", () => {
      const entity1 = createEntity(world, [withValue(Position, { x: 1, y: 2 }), withValue(CanMove, {})]);
      const entity2 = createEntity(world, [withValue(Position, { x: 4, y: 2 })]);
      const updateQuery = defineUpdateQuery(world, [Has(Position), Has(CanMove)], { runOnInit: true });
      expect(updateQuery.get()).toEqual(new Set([entity1]));

      setComponent(CanMove, entity2, {});
      expect(updateQuery.get()).toEqual(new Set([entity2]));

      setComponent(Position, entity1, { x: 2, y: 4 });
      expect(updateQuery.get()).toEqual(new Set([entity1]));
    });

    it("should be observable", () => {
      let ranTimes = 0;
      const entity = createEntity(world);
      const updateQuery = defineUpdateQuery(world, [Has(Position)]);

      reaction(
        () => updateQuery.get(),
        () => {
          ranTimes++;
        }
      );

      setComponent(Position, entity, { x: 2, y: 3 });
      expect(ranTimes).toBe(1);

      removeComponent(Position, entity);
      expect(ranTimes).toBe(2);
    });
  });
});
