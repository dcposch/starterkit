// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTest } from 'ds-test/test.sol';

// import { Vm } from 'forge-std/Vm.sol';
// import { World } from 'lattice-ecs/World.sol';
// import { Component } from 'lattice-ecs/Component.sol';

// import { BoolComponent } from '../components/BoolComponent.sol';
// import { UintComponent } from '../components/UintComponent.sol';
// import { StringComponent } from '../components/StringComponent.sol';
// import { CoordComponent, Coord } from '../components/CoordComponent.sol';
// import { Game, Components } from '../Game.sol';

// Outside World
// import { MockL2Bridge } from 'persona/test/mocks/MockL2Bridge.sol';
// import { MockConsumer } from 'persona/test/mocks/MockConsumer.sol';
// import { Persona } from 'persona/L1/Persona.sol';
// import { EmptyPersonaTokenURIGenerator } from 'persona/L1/EmptyPersonaTokenURIGenerator.sol';
// import { PersonaMirror } from 'persona/L2/PersonaMirror.sol';
// import { PersonaAllMinter } from 'persona/L1/PersonaAllMinter.sol';

contract GameTest is DSTest {
  //   Vm internal immutable vm = Vm(HEVM_ADDRESS);
  //   address internal alice = address(3);
  //   address internal bob = address(2);
  //   address internal deployer = address(1);
  //   MockL2Bridge public bridge;
  //   Persona public persona;
  //   PersonaAllMinter public personaAllMinter;
  //   EmptyPersonaTokenURIGenerator public tokenURIGenerator;
  //   PersonaMirror public personaMirror;
  //   MockConsumer public consumer;
  //   Game internal game;
  //   function setUp() public {
  //     vm.startPrank(deployer);
  //     address world = address(new World());
  //     // deploy persona, persona mirror, and the bridge
  //     bridge = new MockL2Bridge();
  //     tokenURIGenerator = new EmptyPersonaTokenURIGenerator();
  //     persona = new Persona('L', 'L', address(bridge), address(0));
  //     personaAllMinter = new PersonaAllMinter();
  //     personaAllMinter.setPersona(address(persona));
  //     persona.setMinter(address(personaAllMinter), true);
  //     personaMirror = new PersonaMirror(address(persona), address(bridge));
  //     persona.setPersonaMirrorL2(address(personaMirror));
  //     consumer = new MockConsumer(address(personaMirror));
  //     Components memory components = Components({
  //       ownedBy: new UintComponent(world),
  //       movable: new BoolComponent(world),
  //       mined: new BoolComponent(world),
  //       miner: new BoolComponent(world),
  //       heart: new BoolComponent(world),
  //       life: new UintComponent(world),
  //       attack: new UintComponent(world),
  //       texture: new StringComponent(world),
  //       appearance: new UintComponent(world),
  //       position: new CoordComponent(world)
  //     });
  //     address[] memory componentList = new address[](10);
  //     componentList[0] = address(components.ownedBy);
  //     componentList[1] = address(components.movable);
  //     componentList[2] = address(components.mined);
  //     componentList[3] = address(components.miner);
  //     componentList[4] = address(components.heart);
  //     componentList[5] = address(components.life);
  //     componentList[6] = address(components.attack);
  //     componentList[7] = address(components.texture);
  //     componentList[8] = address(components.appearance);
  //     componentList[9] = address(components.position);
  //     game = new Game(world, address(personaMirror));
  //     for (uint256 i; i < componentList.length; i++) {
  //       Component(componentList[i]).transferOwnership(address(game));
  //     }
  //     game.registerComponents(components, componentList);
  //     vm.stopPrank();
  //     mintPersonaToAddressAndSetupImpersonator(alice, bob);
  //   }
  //   function mintPersonaToAddressAndSetupImpersonator(address alice, address bob) public returns (uint256) {
  //     vm.startPrank(deployer);
  //     PersonaAllMinter personaAllMinter = personaAllMinter;
  //     PersonaMirror personaMirror = personaMirror;
  //     personaAllMinter.mintPersona(alice);
  //     uint256 personaId = 1;
  //     vm.stopPrank();
  //     // give access to bob
  //     vm.startPrank(alice);
  //     personaMirror.authorize(personaId, bob, address(game), new bytes4[](0));
  //     vm.stopPrank();
  //     // impersonate that persona with bob
  //     vm.startPrank(bob);
  //     personaMirror.impersonate(personaId, address(game));
  //     vm.stopPrank();
  //   }
  //   function testSpawn() public {
  //     vm.startPrank(bob);
  //     game.spawn(Coord(10, 10));
  //   }
}
