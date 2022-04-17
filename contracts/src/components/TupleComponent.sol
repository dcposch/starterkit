// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import 'lattice-ecs/Component.sol';

contract TupleComponent is Component {
  constructor(address world) Component(world) {}

  function set(
    uint256 entity,
    uint256 value1,
    uint256 value2
  ) public {
    set(entity, abi.encode(value1, value2));
  }

  function getValue(uint256 entity) public view returns (uint256, uint256) {
    return abi.decode(getRawValue(entity), (uint256, uint256));
  }

  function getEntitiesWithValue(uint256 value1, uint256 value2) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(value1, value2));
  }
}
