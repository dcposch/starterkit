import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { blue } from 'colorette';

export async function deployComponent(
  hre: HardhatRuntimeEnvironment,
  world: string,
  gameAddress: string,
  name: string,
  contract: string
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log(blue('Deploying Component: ' + name));
  await deploy(name, {
    from: deployer,
    log: true,
    autoMine: true,
    args: [world],
    contract: contract,
  });

  console.log(blue('Transferring ownership'));
  const component = await hre.ethers.getContract(name, deployer);
  const owner = await component.owner();
  if(owner !== deployer && owner !== gameAddress) {
    throw new Error("Can't transfer ownership to game")
  }
  if(owner !== gameAddress) {
    const tx = await component.transferOwnership(gameAddress);
    await tx.wait();
  }

  return component.address;
}

export async function deployComponents(
  hre: HardhatRuntimeEnvironment,
  world: string,
  gameAddress: string,
  components: { [key: string]: string }
) {
  const componentContracts: { [key: string]: string } = {};
  for (const [name, contract] of Object.entries(components)) {
    componentContracts[name] = await deployComponent(hre, world, gameAddress, name, contract);
  }
  return componentContracts;
}
