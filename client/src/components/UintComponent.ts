import { defineComponent, Type, World } from "@latticexyz/mobx-ecs";
import { defaultAbiCoder as abi } from "ethers/lib/utils";

export function createUintComponent(world: World, name?: string) {
  return defineComponent(world, { value: Type.Number }, { name });
}

export function decodeUintComponent(data: string) {
  const decoded = abi.decode(["uint256"], data);
  return { value: decoded[0].toNumber() };
}
