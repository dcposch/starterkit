import { defineComponent, Type, World } from "@latticexyz/mobx-ecs";
import { defaultAbiCoder as abi } from "ethers/lib/utils";

export function createAddressComponent(world: World, name?: string) {
  return defineComponent(world, { value: Type.String }, { name });
}

export function decodeAddressComponent(data: string) {
  const decoded = abi.decode(["address"], data);
  return { value: decoded[0] };
}
