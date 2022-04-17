// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import 'lattice-ecs/Component.sol';

struct Coord {
  uint256 x;
  uint256 y;
}

contract CoordComponent is Component {
  constructor(address world) Component(world) {}

  function set(uint256 entity, Coord calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (Coord memory) {
    (uint256 x, uint256 y) = abi.decode(getRawValue(entity), (uint256, uint256));
    return Coord(x, y);
  }

  function getEntitiesWithValue(Coord calldata coord) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(coord));
  }
}
