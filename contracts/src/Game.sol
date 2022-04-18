// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.13;

import { console } from 'forge-std/console.sol';
import { World } from 'lattice-ecs/World.sol';
import { Component } from 'lattice-ecs/Component.sol';
import { QueryFragment, QueryType, LibQuery } from 'lattice-ecs/LibQuery.sol';
import { CoordComponent, Coord } from './components/CoordComponent.sol';
import { UintComponent } from './components/UintComponent.sol';
import { StringComponent } from './components/StringComponent.sol';
import { BoolComponent } from './components/BoolComponent.sol';
import { TupleComponent } from './components/TupleComponent.sol';
import { manhattan } from './utils.sol';
import { PersonaMirror } from 'persona/L2/PersonaMirror.sol';

struct Components {
  CoordComponent position;
  StringComponent texture;
  UintComponent appearance;
  UintComponent ownedBy;
  BoolComponent movable;
  BoolComponent miner;
  BoolComponent mined;
  BoolComponent heart;
  UintComponent attack;
  TupleComponent life;
}
enum Texture {
  Imp,
  Creature,
  Heart,
  Ground
}

contract Game {
  PersonaMirror public personaMirror;
  address public world;
  address public owner;
  uint256 public width = 32;
  uint256 public height = 32;
  address[] public componentList;
  Components public c;

  modifier onlyContractOwner() {
    require(msg.sender == owner, 'only contract owner');
    _;
  }
  modifier onlyEntityOwner(uint256 entity) {
    require(c.ownedBy.getValue(entity) == getPersona(), 'invalid owner');
    _;
  }

  modifier onlyAdjacent(uint256 entity, Coord memory target) {
    require(manhattan(c.position.getValue(entity), target) == 1, 'not adjacent');
    _;
  }

  modifier inBounds(Coord memory coord) {
    require(coord.x < width && coord.y < height, 'out of bounds');
    _;
  }

  constructor(address _world, address _personaMirror) {
    owner = msg.sender;
    world = _world;
    personaMirror = PersonaMirror(_personaMirror);
  }

  function registerComponents(Components memory _components, address[] memory _componentList) public onlyContractOwner {
    c = _components;
    componentList = _componentList;

    string memory imp = 'https://imagedelivery.net/kiVB3FlOmd8gwoTJWblSOA/ef4adf50-0e0d-4959-9917-439de7ed9500/public';
    string
      memory creature = 'https://imagedelivery.net/kiVB3FlOmd8gwoTJWblSOA/e77e4f90-5047-4c82-7c4d-80057d12f200/public';
    string
      memory heart = 'https://imagedelivery.net/kiVB3FlOmd8gwoTJWblSOA/62e3c547-6d33-4df0-3da5-2f965875ae00/public';
    string
      memory ground = 'https://imagedelivery.net/kiVB3FlOmd8gwoTJWblSOA/47011e62-ea03-44df-51b7-441f42588a00/public';

    c.texture.set(uint256(Texture.Imp), imp);
    c.texture.set(uint256(Texture.Creature), creature);
    c.texture.set(uint256(Texture.Heart), heart);
    c.texture.set(uint256(Texture.Ground), ground);
  }

  function getPersona() internal view returns (uint256) {
    uint256 personaId = personaMirror.getActivePersona(msg.sender, address(this));
    require(personaMirror.isAuthorized(personaId, msg.sender, address(this), msg.sig), 'persona not authorized');
    return personaId;
  }

  /**
   * Remove all components from the given entity
   */
  function remove(uint256 entity) internal {
    for (uint256 i; i < componentList.length; i++) {
      Component(componentList[i]).remove(entity);
    }
  }

  /**
   * Utility function to get all entities with a given componnt at the given coord
   */
  function getEntityWithAt(Component component, Coord memory coord) internal view returns (uint256 entity, bool found) {
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.HasValue, c.position, abi.encode(coord));
    fragments[1] = QueryFragment(QueryType.Has, component, new bytes(0));
    uint256[] memory entities = LibQuery.query(fragments);
    if (entities.length == 0) return (0, false);
    return (entities[0], true);
  }

  function mine(Coord memory coord) internal {
    uint256 tile = World(world).getNumEntities();
    c.position.set(tile, coord);
    c.mined.set(tile);
    c.appearance.set(tile, uint256(Texture.Ground));
  }

  function combat(uint256 attacker, uint256 defender) internal {
    uint256 atkValue = c.attack.getValue(attacker);
    (uint256 life, uint256 max) = c.life.getValue(defender);
    if (atkValue >= life) {
      // Critical hit, set defender's life to 0 and remove the defender
      c.life.set(defender, 0, max);
      remove(defender);
    } else {
      // Non-critical hit, decrease life
      c.life.set(defender, life - atkValue, max);
    }
  }

  function spawn(Coord memory center) public inBounds(center) {
    // Check player is not spawned yet
    require(c.ownedBy.getEntitiesWithValue(getPersona()).length == 0, 'already spawned');

    // Create player entity (to indicate spawn)
    uint256 playerEntity = World(world).getNumEntities();
    c.ownedBy.set(playerEntity, getPersona());

    // Check spawn area is empty, then mine
    for (uint256 dx; dx < 3; dx++) {
      for (uint256 dy; dy < 3; dy++) {
        Coord memory coord = Coord(center.x - 1 + dx, center.y - 1 + dy);
        require(c.position.getEntitiesWithValue(coord).length == 0, 'invalid spawn pos');
        mine(coord);

        // Spawn entities
        uint256 entity = World(world).getNumEntities();
        c.position.set(entity, coord);
        c.ownedBy.set(entity, getPersona());

        // Put heart at the center
        if (dx == 1 && dy == 1) {
          c.heart.set(entity);
          c.life.set(entity, 10, 10);
          c.attack.set(entity, 1);
          c.appearance.set(entity, uint256(Texture.Heart));
        } else if ((dx + dy) % 2 == 0) {
          // Put creatures at diagonal positions
          c.life.set(entity, 10, 10);
          c.attack.set(entity, 3);
          c.movable.set(entity);
          c.appearance.set(entity, uint256(Texture.Creature));
        } else {
          // Put imps at vertical/horizontal positions
          c.life.set(entity, 5, 5);
          c.movable.set(entity);
          c.miner.set(entity);
          c.appearance.set(entity, uint256(Texture.Imp));
        }
      }
    }
  }

  function action(uint256 entity, Coord memory target)
    public
    onlyEntityOwner(entity)
    onlyAdjacent(entity, target)
    inBounds(target)
  {
    // Check for mined tiles at the target coord
    (uint256 targetEntity, bool foundTargetEntity) = getEntityWithAt(c.mined, target);

    // If the target coord is not mined and the active entity can mine, mine the target tile
    if (!foundTargetEntity && c.miner.has(entity)) {
      return mine(target);
    }

    // If the target tile is mined and unoccupied and the active enity can move, move there
    // (Unoccupied and mined means only the mined tile entity has this position)
    if (foundTargetEntity && c.position.getEntitiesWithValue(target).length == 1 && c.movable.has(entity)) {
      return c.position.set(entity, target);
    }

    // If the target tile is occupied by an entity with life and the active entity can attack, attack the target entity
    (targetEntity, foundTargetEntity) = getEntityWithAt(c.life, target);
    if (foundTargetEntity && c.attack.has(entity)) {
      // Target entity attacks first
      if (c.attack.has(targetEntity) && c.life.has(entity)) {
        combat(targetEntity, entity);
      }

      // Calling entity attacks second
      if (c.attack.has(entity) && c.life.has(targetEntity)) {
        combat(entity, targetEntity);
      }

      return;
    }

    revert('Invalid action');
  }
}
