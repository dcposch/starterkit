// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.13;

import { console } from 'forge-std/console.sol';
import { World } from 'lattice-ecs/World.sol';
import { Component } from 'lattice-ecs/Component.sol';
import { CoordComponent, Coord } from './components/CoordComponent.sol';
import { UintComponent } from './components/UintComponent.sol';
import { StringComponent } from './components/StringComponent.sol';
import { AddressComponent } from './components/AddressComponent.sol';
import { BoolComponent } from './components/BoolComponent.sol';
import { TupleComponent } from './components/TupleComponent.sol';

struct Components {
  CoordComponent position;
  StringComponent texture;
  UintComponent appearance;
  AddressComponent ownedBy;
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

  constructor(address _world) {
    owner = msg.sender;
    world = _world;
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

  /**
   * Remove all components from the given entity
   */
  function remove(uint256 entity) internal {
    for (uint256 i; i < componentList.length; i++) {
      Component(componentList[i]).remove(entity);
    }
  }

  function mine(Coord memory coord) internal {
    uint256 tile = World(world).getNumEntities();
    c.position.set(tile, coord);
    c.mined.set(tile);
    c.appearance.set(tile, uint256(Texture.Ground));
  }

  function spawn(Coord memory center) public {
    // Check player is not spawned yet
    require(c.ownedBy.getEntitiesWithValue(msg.sender).length == 0, 'already spawned');

    // Create player entity (to indicate spawn)
    uint256 playerEntity = World(world).getNumEntities();
    c.ownedBy.set(playerEntity, msg.sender);

    // Check spawn area is empty, then mine
    for (uint256 dx; dx < 3; dx++) {
      for (uint256 dy; dy < 3; dy++) {
        Coord memory coord = Coord(center.x - 1 + dx, center.y - 1 + dy);
        require(c.position.getEntitiesWithValue(coord).length == 0, 'invalid spawn pos');
        mine(coord);

        // Spawn entities
        uint256 entity = World(world).getNumEntities();
        c.position.set(entity, coord);
        c.ownedBy.set(entity, msg.sender);

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
}
