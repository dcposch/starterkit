// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import 'lattice-ecs/Component.sol';

contract AddressComponent is Component {
  constructor(address world) Component(world) {}

  function set(uint256 entity, address addr) public {
    set(entity, abi.encode(addr));
  }

  function getValue(uint256 entity) public view returns (address) {
    return abi.decode(getRawValue(entity), (address));
  }

  function getEntitiesWithValue(address addr) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(addr));
  }
}
