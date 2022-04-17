import { defineComponent, Type, World } from "@latticexyz/mobx-ecs";
import { defaultAbiCoder as abi } from "ethers/lib/utils";

export function createCoordComponent(world: World, name?: string) {
  return defineComponent(world, { x: Type.Number, y: Type.Number }, { name });
}

export function decodeCoordComponent(data: string) {
  const decoded = abi.decode(["uint256", "uint256"], data);
  return { x: decoded[0].toNumber(), y: decoded[1].toNumber() };
}
