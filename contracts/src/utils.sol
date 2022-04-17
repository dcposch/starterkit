// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { Coord } from './components/CoordComponent.sol';

function manhattan(Coord memory a, Coord memory b) pure returns (uint256) {
  uint256 dx = a.x > b.x ? a.x - b.x : b.x - a.x;
  uint256 dy = a.y > b.y ? a.y - b.y : b.y - a.y;
  return dx + dy;
}

function coordEq(Coord memory a, Coord memory b) pure returns (bool) {
  return a.x == b.x && a.y == b.y;
}
