const NetlifyAPI = require("netlify");
import { ethers } from "ethers";
import chalk from "chalk";
import inquirer from "inquirer";
import { v4 } from "uuid";
import { Listr, Logger } from "listr2";
import execa from "execa";
import { exit } from "process";
import * as fs from "fs";
inquirer.registerPrompt("suggest", require("inquirer-prompt-suggest"));

interface Answers {
    chainId: number;
    deploymentName: string;
    deployClient: boolean;
    clientUrl: string | undefined;
    netlifySlug: string | undefined;
}

interface DeployerConfig {
    netlifyPersonalToken: string,
    deployerMnemonic: string,
}

export function isValidHttpUrl(s: string): boolean {
    let url: URL | undefined;

    try {
        url = new URL(s);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

export const findGameContractAddress = (deployLogLines: string[]): string => {
    for (const logLine of deployLogLines) {
        if (logLine.includes("Game Deployed At")) {
            return logLine.split(":")[1].trim();
        }
    }
    throw new Error("Expected to find a log line for the Game Deployed");
}

export const SUPPORTED_DEPLOYMENT_CHAINS: { [key: number]: { network: string; name: string; rpcUrl: string } } = {
    69: {
        name: "Optimistic Kovan",
        network: "optimisticKovan",
        rpcUrl: "https://kovan.optimism.io",
    },
    300: {
        name: "Optimism Gnosis Chain",
        network: "optimismGnosisChain",
        rpcUrl: "https://optimism.gnosischain.com",
    },
    31337: {
        name: "Hardhat",
        network: "hardhat",
        rpcUrl: "http://localhost:8545/",
    }
};

export const deploy = async () => {
    const logger = new Logger({ useIcons: true });

    console.log();
    console.log(chalk.bgWhite.black.bold(" == Lattice StarterKit Deployer == "));
    console.log();

    const config: DeployerConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'))

    const netlifyAPI = new NetlifyAPI(config.netlifyPersonalToken);
    const netlifyAccounts = (await netlifyAPI.listAccountsForUser()).map((a: any) => a.slug);
    const answers: Answers = (await inquirer.prompt([
        {
            type: "list",
            name: "chainId",
            choices: Object.entries(SUPPORTED_DEPLOYMENT_CHAINS).map(([chainId, { name }]) => ({
                name: name,
                value: parseInt(chainId),
            })),
            message: "Select an available chain",
            loop: false,
        },
        {
            type: "suggest",
            name: "deploymentName",
            message: "Enter a name for your deployment:",
            suggestions: [
                "My Workshop Game",
                "Devconnect 2022",
                "Amsterdam",
            ],
            validate: (input: string) => {
                if (input.length < 4) {
                    return "Invalid: 4 characters minimum";
                }
                return true;
            },
        },
        {
            type: "list",
            message: "Would you like to deploy the game client?",
            choices: [
                { name: "Yes", value: true },
                { name: "No", value: false },
            ],
            name: "deployClient",
            validate: (i) => {
                if (!!i && config.netlifyPersonalToken.length === 0) {
                    return "You don't have a netlify api token. Can't deploy clients using the cli.";
                }
            },
        },
        {
            type: "list",
            message: "From which netlify account?",
            choices: netlifyAccounts,
            name: "netlifySlug",
            when: (answers) => answers.deployClient,
        },
        {
            type: "input",
            name: "clientUrl",
            message: "Enter URL of already deployed client:",
            when: (answers) => !answers.deployClient,
            validate: (i) => {
                if (isValidHttpUrl(i)) {
                    if (i[i.length - 1] === "/") {
                        return "No trailing slash";
                    }
                    return true;
                } else {
                    return "Not a valid URL";
                }
            },
        },
    ])) as Answers;

    const id = v4().substring(0, 6);
    console.log();
    console.log(chalk.yellow(`>> Deploying ${chalk.bgYellow.black.bold(" " + answers.deploymentName + " ")} <<`));

    const wallet = ethers.Wallet.fromMnemonic(config.deployerMnemonic);
    console.log(chalk.red(`>> Deployer address: ${chalk.bgYellow.black.bold(" " + wallet.address + " ")} <<`));
    console.log();

    let gameContractAddress: string | undefined = undefined;
    let gameClientUrl: string | undefined = undefined;

    const { network, name } = SUPPORTED_DEPLOYMENT_CHAINS[answers.chainId];
    try {
        const tasks = new Listr([
            {
                title: "Deploying",
                task: () => {
                    return new Listr(
                        [
                            {
                                title: "Contracts",
                                task: async (ctx, task) => {
                                    const child = execa(
                                        "yarn",
                                        ["workspace", "contracts", "hh-deploy", "--network", network, "--reset"],
                                        {
                                            env: {
                                                DEPLOYER_MNEMONIC: config.deployerMnemonic,
                                            },
                                        }
                                    );
                                    child.stdout?.pipe(task.stdout());
                                    const { stdout } = await child;
                                    const lines = stdout.split("\n");

                                    gameContractAddress = findGameContractAddress(lines);
                                    ctx.gameContractAddress = gameContractAddress;

                                    task.output = chalk.yellow(`Game deployed at: ${chalk.bgYellow.black(gameContractAddress)} on chain: ${chalk.bgYellow.black(name)}`);
                                },
                                options: { bottomBar: 3 },
                            },
                            {
                                title: "Client",
                                task: () => {
                                    return new Listr([
                                        {
                                            title: "Building",
                                            task: async (_, task) => {
                                                const time = Date.now();
                                                task.output = "Building local client...";
                                                const child = execa("yarn", ["workspace", "client", "build"]);
                                                await child;
                                                const duration = Date.now() - time;
                                                task.output = "Client built in " + Math.round(duration / 1000) + "s";
                                            },
                                            skip: () => !answers.deployClient,
                                            options: { bottomBar: 3 },
                                        },
                                        {
                                            title: "Creating",
                                            task: async (ctx, task) => {
                                                const site = await netlifyAPI.createSite({
                                                    body: {
                                                        name: `lattice-starterkit-deployment-${wallet.address.substring(2, 8)}-${id}`,
                                                        account_slug: answers.netlifySlug!,
                                                        ssl: true,
                                                        force_ssl: true,
                                                    },
                                                });
                                                ctx.siteId = site.id;
                                                ctx.clientUrl = site.ssl_url;
                                                gameClientUrl = site.ssl_url;

                                                task.output = "Netlify site created with id: " + chalk.bgYellow.black(site.id);
                                            },
                                            skip: () => !answers.deployClient || !answers.netlifySlug,
                                            options: { bottomBar: 1 },
                                        },
                                        {
                                            title: "Deploying",
                                            task: async (ctx, task) => {
                                                const child = execa(
                                                    "yarn",
                                                    ["workspace", "client", "run", "netlify", "deploy", "--prod"],
                                                    {
                                                        env: {
                                                            NETLIFY_AUTH_TOKEN: config.netlifyPersonalToken,
                                                            NETLIFY_SITE_ID: ctx.siteId,
                                                        },
                                                    }
                                                );
                                                child.stdout?.pipe(task.stdout());
                                                await child;
                                                task.output = chalk.yellow("Netlify site deployed!");
                                            },
                                            skip: () => !answers.deployClient,
                                            options: { bottomBar: 3 },
                                        }
                                    ],
                                        { concurrent: false }
                                    );
                                }
                            },
                            {
                                title: "Redirect to Lattice Launcher",
                                task: async (ctx, _) => {
                                    const gameContractAddress = ctx.gameContractAddress;
                                    const clientUrl = answers.deployClient ? ctx.clientUrl : answers.clientUrl;
                                    const deepLinkURI = `lattice://deployFromCLI?gameContractAddress=${gameContractAddress}&chainId=${answers.chainId}&clientUrl=${clientUrl}&name=${answers.deploymentName}`;
                                    require("openurl").open(deepLinkURI);
                                },
                                options: { bottomBar: 3 },
                            },
                        ],
                        { concurrent: false }
                    );
                },
            },
        ]);
        await tasks.run();
        console.log();
        console.log(chalk.bgGreen.black.bold(" Congratulations! Deployment successful"));
        console.log();
        console.log(chalk.green(`Game contract deployed to ${gameContractAddress}`));
        console.log(chalk.green(`Game client deployed to ${gameClientUrl}`));
        console.log();
    } catch (e) {
        logger.fail((e as Error).message);
    }
    exit(0);
};

deploy();
