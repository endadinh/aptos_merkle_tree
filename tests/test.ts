import { AptosAccount, AptosClient, CoinClient, FaucetClient, HexString, MaybeHexString, TokenClient, } from "aptos"
import { HelloAptosClient } from '../Client/AptosClient';
import { Hasher } from '../common/ts/hasher';
import { MerkleTreeSha256 } from '../common/ts/merkle_tree';
import { MerkleTreeService } from '../Client/merkle_tree.service';


const FAUCET_URL = "https://faucet.devnet.aptoslabs.com"

const NODE_URL = "https://fullnode.devnet.aptoslabs.com"

describe("Hello Aptos", () => {
    // APTOS CLIENT DEFINED
    let client: HelloAptosClient
    let faucetClient: FaucetClient
    let coinClient: CoinClient
    let tokenClient: TokenClient

    // ACCOUNT DEFINED
    let defaultAccount: AptosAccount
    let deployerAccount: AptosAccount
    let resourceAccount: AptosAccount
    let userAccount: AptosAccount

    const CONTRACT_ADDRESS = '0x1c40294f4bbcc145b9a21af713242488a3f41f61665db4d61cdd299ad4aff2fb';

    let userParams1 = { 
        "Name" : "Noir",
        "Age"  : "20",
        "Job"  : "IT"
    }

    const hashes: Buffer[] = [
        Hasher.keckka256(Buffer.from(JSON.stringify(userParams1))),
        Hasher.keckka256(Buffer.from('2acb')),
        Hasher.keckka256(Buffer.from('3acb')),
      ];


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
        defaultAccount = new AptosAccount(Uint8Array.from([137, 206, 72, 75, 226, 122, 39, 49, 67, 110, 36, 246, 102, 108, 115, 237, 24, 99, 195, 4, 211, 249, 143, 123, 220, 13, 202, 94, 219, 38, 210, 58]));
        await faucetClient.fundAccount(defaultAccount.address(), 100000000);

        // // Generate accounts.
        // deployerAccount = new AptosAccount();
        // resourceAccount = new AptosAccount();
        // userAccount = new AptosAccount();

        const deployerPrivateKey = await deployerAccount.toPrivateKeyObject();
        const resourcePrivateKey = await resourceAccount.toPrivateKeyObject();
        const userPrivateKey = await userAccount.toPrivateKeyObject();
        const defaultPrivateKey = await defaultAccount.toPrivateKeyObject();

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


        console.log(`Default Address: ${defaultAccount.address()}`);
        console.log(`Default PrivateKey: ${defaultPrivateKey.privateKeyHex}`);
        console.log(`Default Public Key: ${defaultPrivateKey.publicKeyHex}`);
        

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


    })

    // it('sha256_test', async function() {
    //     // const hashes: Buffer[] = [
    //     //   Hasher.keckka256(Buffer.from([2,1,156,123,56])),
    //     //   Hasher.keckka256(Buffer.from('2acb')),
    //     //   Hasher.keckka256(Buffer.from('3acb')),
    //     // ];
    //     const tree = new MerkleTreeSha256(hashes);
    //     const leaf = Hasher.keckka256(Buffer.from([2,1,156,123,56]));
    //     const proofs = tree.proofs(0).map(node => node.hash);
    //     const root = tree.root().hash;

    //     console.log(`
    //         Tree: ${tree},
    //         Leaf: ${leaf.toString('hex')},
    //         Proofs: ${proofs.map(proof => proof.toString('hex'))},
    //     `)


    //     await MerkleTreeService.sha256(
    //       client,
    //       defaultAccount,
    //       leaf,
    //       proofs,
    //       root,
    //       CONTRACT_ADDRESS,
    //     );
    //   });

    it('set_root test', async function() { 
        const tree = new MerkleTreeSha256(hashes);
        const root = tree.root().hash;

        await MerkleTreeService.set_root( 
            client,
            defaultAccount,
            root,
            CONTRACT_ADDRESS
        );
    });

    it('verify test', async function() { 
        const tree = new MerkleTreeSha256(hashes);
        const proofs = tree.proofs(0).map(node => node.hash);
        let params = { 
            "Name" : "Noir",
            "Age"  : "20",
            "Job"  : "IT"
        }

        let paramsEncode = Buffer.from(JSON.stringify(params));

        await MerkleTreeService.verify(
            client,
            defaultAccount,
            proofs,
            paramsEncode,
            CONTRACT_ADDRESS
        );
    });
})