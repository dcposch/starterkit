// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import 'lattice-ecs/Component.sol';

contract StringComponent is Component {
  constructor(address world) Component(world) {}

  function set(uint256 entity, string memory str) public {
    set(entity, abi.encode(str));
  }

  function getValue(uint256 entity) public view returns (string memory) {
    return abi.decode(getRawValue(entity), (string));
  }

  function getEntitiesWithValue(string memory str) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(str));
  }
}
