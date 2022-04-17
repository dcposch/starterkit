import { defineComponent, Type, World } from "@latticexyz/mobx-ecs";
import { defaultAbiCoder as abi } from "ethers/lib/utils";

export function createTupleComponent(world: World, name?: string) {
  return defineComponent(world, { value1: Type.Number, value2: Type.Number }, { name });
}

export function decodeTupleComponent(data: string) {
  const decoded = abi.decode(["uint256", "uint256"], data);
  return { value1: decoded[0].toNumber(), value2: decoded[1].toNumber() };
}
