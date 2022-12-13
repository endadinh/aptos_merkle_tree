import keccak256  from 'keccak256';
import { AptosAccount, AptosClient, CoinClient, FaucetClient, HexString, MaybeHexString, TokenClient, } from "aptos"
import { HelloAptosClient } from '../Client/AptosClient';

import { Schedule, MerkleDistributionService } from "../Helper/merkle_distribution.service";
import { MerkleTree } from '../Helper/merkle_tree';
import { BN } from 'bn.js';

const FAUCET_URL = "https://faucet.devnet.aptoslabs.com"

const NODE_URL = "https://fullnode.devnet.aptoslabs.com"

describe("Hello Aptos", () => {
    // APTOS CLIENT DEFINED
    let client: HelloAptosClient
    let faucetClient: FaucetClient
    let coinClient: CoinClient
    let tokenClient: TokenClient

    // ACCOUNT DEFINED
    let deployerAccount: AptosAccount
    let resourceAccount: AptosAccount
    let userAccount: AptosAccount
    let tree_whitelist: MerkleTree
    let new_schedule_1: Schedule

    before("Create Connection", async () => {
        client = new HelloAptosClient;
        faucetClient = new FaucetClient(NODE_URL, FAUCET_URL)

        // Create a coin client for checking account balances.
        coinClient = new CoinClient(client);
        tokenClient = new TokenClient(client);
        let privateKeyBytes_deployer = new TextEncoder().encode("0x8fe18fc5f09f852a9699278950cee5544b52d7817b2c808ca94b678417eff105");
        let privateKeyBytes_resource = new TextEncoder().encode("0xde1fd2dc6c501e80d28fb74ae9929f6473d93302101f78437a7e44245133cdea");
        let privateKeyBytes_user = new TextEncoder().encode("0x55ce7b24f7d89cdd22a055f29ee5f70996976f95a5e702fde8915ba92b9b5bcc");

        // Create accounts from seed.
        deployerAccount = new AptosAccount(privateKeyBytes_deployer);
        resourceAccount = new AptosAccount(privateKeyBytes_resource);
        userAccount = new AptosAccount(privateKeyBytes_user);

        // // Generate accounts.
        // deployerAccount = new AptosAccount();
        // resourceAccount = new AptosAccount();
        // userAccount = new AptosAccount();

        const deployerPrivateKey = await deployerAccount.toPrivateKeyObject();
        const resourcePrivateKey = await resourceAccount.toPrivateKeyObject();
        const userPrivateKey = await userAccount.toPrivateKeyObject();

        // Print out account .
        console.log("=== Account generated ===");

        console.log(`Deployer Address: ${deployerAccount.address()}`);
        console.log(`Deployer private key : ${deployerPrivateKey.privateKeyHex}`)
        console.log(`Deployer Public key : ${deployerPrivateKey.publicKeyHex}`)

        console.log(`Resource Address: ${resourceAccount.address()}`);
        console.log(`Resource PrivateKey: ${resourcePrivateKey.privateKeyHex}`);
        console.log(`Resource Public Key: ${resourcePrivateKey.publicKeyHex}`);

        console.log(`User Address: ${userAccount.address()}`);
        console.log(`User PrivateKey: ${userPrivateKey.privateKeyHex}`);
        console.log(`User Public Key: ${userPrivateKey.publicKeyHex}`);

        // Fund accounts.

        // await faucetClient.fundAccount(deployerAccount.address(), 100_000_000);
        // await faucetClient.fundAccount(resourceAccount.address(), 100_000_000);
        // await faucetClient.fundAccount(userAccount.address(), 100_000_000);

        // console.log("=== Initial Coin Balances ===");
        // console.log(`Deployer: ${await coinClient.checkBalance(deployerAccount)}`);
        // console.log(`Resource: ${await coinClient.checkBalance(resourceAccount)}`);
        // console.log(`User: ${await coinClient.checkBalance(userAccount)}`);
        // console.log("");

        // INIT SCHEDULE WHITELIST

        const new_schedule_0: Schedule = {
            index: 0,
            address: Buffer.from(userAccount.address().toString()),
            receivingId: 1,
            receivingAmount: new BN(1),
            sendingAmount: new BN(0),
        }
        new_schedule_1 = {
            index: 1,
            address:  Buffer.from(resourceAccount.address().toString()),
            receivingId: 2,
            receivingAmount: new BN(1),
            sendingAmount: new BN(0),
        }
        const new_schedule_2: Schedule = {
            index: 2,
            address:  Buffer.from(deployerAccount.address().toString()),
            receivingId: 3,
            receivingAmount: new BN(1),
            sendingAmount: new BN(0),
        }

        tree_whitelist = await MerkleDistributionService.createTree([new_schedule_0, new_schedule_1, new_schedule_2]);
    })

    // it("Verify", async () => {
    //     let roots = await tree_whitelist.root();
    //     let proofs = await MerkleDistributionService.printProof(tree_whitelist,1);
    //     let root = Uint8Array.from(roots.hash);
    //     let proofsConverted = [Uint8Array.from(proofs[0].hash), Uint8Array.from(proofs[1].hash)];
    //     let leaf = await MerkleDistributionService.computeHash(new_schedule_1)
    //     let leafConverted = Uint8Array.from(leaf);
    //     console.log('test',  `0x${new_schedule_1.address.toString('hex')}`);
    //     console.log('test', Buffer.from(deployerAccount.address().toString()));
    //     console.log(`Data: 
    //     Root: ${root},
    //     Leaf: ${leafConverted},
    //     Proof: ${proofsConverted}
    //     `)
    //     const txHash = await client.verify(
    //         resourceAccount,
    //         proofsConverted,
    //         root,
    //         leafConverted
    //     );
    //     await client.waitForTransaction(txHash, { checkSuccess: true });
    //     console.log(`Verify hash: ${txHash}`);
    // });


    it("Save", async () => {
        let roots = await tree_whitelist.root();
        let proofs = await MerkleDistributionService.printProof(tree_whitelist,1);
        let root = Uint8Array.from(roots.hash);
        let proofsConverted = [Uint8Array.from(proofs[0].hash), Uint8Array.from(proofs[1].hash)];
        let leaf = await MerkleDistributionService.printLeaf(tree_whitelist, 1);
        // console.log('leaf',leaf)
        let leafConverted = Uint8Array.from(leaf.hash);
        

        console.log('printProofs',proofs);
        console.log('printLeaf',leaf)
        // console.log('test',  `0x${new_schedule_1.address.toString('hex')}`);
        // console.log('test', Buffer.from(deployerAccount.address().toString()));

        console.log(`Data: 
        Root: ${root},
        Leaf: ${leafConverted},
        Proof: ${proofsConverted}
        `)
        const txHash = await client.save(
            resourceAccount,
            proofsConverted,
            root,
            leafConverted
        );
        await client.waitForTransaction(txHash, { checkSuccess: true });
        console.log(`Verify hash: ${txHash}`);
    });

    it("Save Compute", async () => {
        let roots = await tree_whitelist.root();
        let proofs = await MerkleDistributionService.printProof(tree_whitelist,1);
        let root = Uint8Array.from(roots.hash);
        let proofsConverted = [Uint8Array.from(proofs[0].hash), Uint8Array.from(proofs[1].hash)];
        let leaf = await MerkleDistributionService.printLeaf(tree_whitelist, 1);
        // console.log('leaf',leaf)
        let leafConverted = Uint8Array.from(leaf.hash);
        

        console.log('printProofs',proofs);
        console.log('printLeaf',leaf)
        // console.log('test',  `0x${new_schedule_1.address.toString('hex')}`);
        // console.log('test', Buffer.from(deployerAccount.address().toString()));

        console.log(`Data: 
        Root: ${root},
        Leaf: ${leafConverted},
        Proof: ${proofsConverted}
        `)
        const txHash = await client.saveCompute(
            resourceAccount,
            proofsConverted,
            root,
        );
        await client.waitForTransaction(txHash, { checkSuccess: true });
        console.log(`Verify hash: ${txHash}`);
    });



    it("Test", async () => {
        let roots = await tree_whitelist.root();
        let proofs = await MerkleDistributionService.printProof(tree_whitelist,1);
        let root = Uint8Array.from(roots.hash);
        let proofsConverted = [Uint8Array.from(proofs[0].hash), Uint8Array.from(proofs[1].hash)];
        let leaf = await MerkleDistributionService.printLeaf(tree_whitelist, 1);
        // console.log('leaf',leaf)
        let leafConverted = Uint8Array.from(leaf.hash);
        

        console.log('printProofs',proofs);
        console.log('printLeaf',leaf)
        // console.log('test',  `0x${new_schedule_1.address.toString('hex')}`);
        // console.log('test', Buffer.from(deployerAccount.address().toString()));

        console.log(`Data: 
        Root: ${root},
        Leaf: ${leafConverted},
        Proof: ${proofsConverted}
        `)
        const txHash = await client.verify(
            resourceAccount,
            proofsConverted,
            root,
            leafConverted
        );
        await client.waitForTransaction(txHash, { checkSuccess: true });
        console.log(`Verify hash: ${txHash}`);
    });


})