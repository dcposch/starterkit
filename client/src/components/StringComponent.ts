import { defineComponent, Type, World } from "@latticexyz/mobx-ecs";
import { defaultAbiCoder as abi } from "ethers/lib/utils";

export function createStringComponent(world: World, name?: string) {
  return defineComponent(world, { value: Type.String }, { name });
}

export function decodeStringComponent(data: string) {
  const decoded = abi.decode(["string"], data);
  return { value: decoded[0] };
}
