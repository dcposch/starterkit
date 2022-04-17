// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import 'lattice-ecs/Component.sol';

contract BoolComponent is Component {
  constructor(address world) Component(world) {}

  function set(uint256 entity) public {
    set(entity, abi.encode(true));
  }

  function getValue(uint256 entity) public view returns (bool) {
    return abi.decode(getRawValue(entity), (bool));
  }

  function getEntitiesWithValue(bool value) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(value));
  }
}
