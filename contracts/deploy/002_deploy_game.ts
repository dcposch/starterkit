import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { blue, green } from 'colorette';
import personaDeployments from '../lib/persona/deployment.json';
import { deployComponents } from '../utils/components';
import { componentConfig } from '../lattice.config';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  let personaMirrorAddress;
  if (hre.network.live) {
    if (!hre.network.config.chainId) {
      throw new Error('no chain id!');
    }
    personaMirrorAddress = (personaDeployments.personaMirror as { [key: number]: string })[hre.network.config.chainId!];
  } else {
    personaMirrorAddress = (await hre.ethers.getContract('PersonaMirror', deployer)).address;
  }

  console.log(blue('Deploying World'));
  const world = await deploy('World', {
    from: deployer,
    log: true,
    autoMine: true,
  });

  console.log(blue('Deploying Game'));
  await deploy('Game', {
    from: deployer,
    log: true,
    autoMine: true,
    args: [world.address, personaMirrorAddress],
  });

  const gameContract = await hre.ethers.getContract('Game', deployer);
  console.log(`Game Deployed At: ${gameContract.address}`);

  console.log(blue('Deploying components'));
  const components = await deployComponents(hre, world.address, gameContract.address, componentConfig);

  console.log('Addresses', components);

  console.log(blue('Linking components'));
  const tx = await gameContract.registerComponents(components, Object.values(components));
  await tx.wait();

  if (!hre.network.live) {
    console.log(blue('Deploying LocalLatticeGameLocator'));
    const localLatticeGameLocator = await deploy('LocalLatticeGameLocator', {
      from: deployer,
      log: true,
      autoMine: true,
      args: [],
      deterministicDeployment: '0xAAAAFFFF',
    });

    console.log(blue('Linking local game'));
    const localLatticeGameLocatorContract = await hre.ethers.getContract('LocalLatticeGameLocator', deployer);
    localLatticeGameLocatorContract.setLocalLatticeGameAddress(gameContract.address);

    console.log(blue('Local Lattice game linked'));
    console.log(green('LocalLatticeGameLocator: ' + localLatticeGameLocator.address));
  }
};
export default func;
func.tags = ['Diamond'];
