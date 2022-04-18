// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.13;

import { console } from 'forge-std/console.sol';
import { World } from 'lattice-ecs/World.sol';
import { Component } from 'lattice-ecs/Component.sol';
import { CoordComponent, Coord } from './components/CoordComponent.sol';
import { UintComponent } from './components/UintComponent.sol';

struct Components {
  CoordComponent position;
  UintComponent num;
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
    c.position.set(0, Coord(0, 0));
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
