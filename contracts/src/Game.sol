// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.13;

import { console } from 'forge-std/console.sol';
import { World } from 'lattice-ecs/World.sol';
import { Component } from 'lattice-ecs/Component.sol';
import { CoordComponent, Coord } from './components/CoordComponent.sol';
import { UintComponent } from './components/UintComponent.sol';
import { StringComponent } from './components/StringComponent.sol';

struct Components {
  CoordComponent position;
  StringComponent texture;
  UintComponent appearance;
}
enum Texture {
  Imp
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
    c.position.set(1, Coord(0, 0));

    string memory imp = 'https://imagedelivery.net/kiVB3FlOmd8gwoTJWblSOA/ef4adf50-0e0d-4959-9917-439de7ed9500/public';
    c.texture.set(uint256(Texture.Imp), imp);

    c.appearance.set(1, uint256(Texture.Imp));
  }

  /**
   * Remove all components from the given entity
   */
  function remove(uint256 entity) internal {
    for (uint256 i; i < componentList.length; i++) {
      Component(componentList[i]).remove(entity);
    }
  }
}
