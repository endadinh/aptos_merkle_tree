import {
    AptosAccount,
    AptosClient
} from 'aptos';
import {
    signAndSendTransaction
} from '../common/ts/client';

export class MerkleTreeService {

    static async sha256(
        client: AptosClient,
        senderAccount: AptosAccount,
        leaf: Buffer,
        proofs: Buffer[],
        root: Buffer,
        contractAddress: string,
    ): Promise<void> {
        const transaction = await client.generateTransaction(senderAccount.address(), {
            function: `${contractAddress}::merkle_tree::sha256`,
            type_arguments: [],
            arguments: [
                leaf,
                proofs,
                root,
            ],
        });

        await signAndSendTransaction(
            client,
            transaction,
            senderAccount,
        );
    }

    static async set_root(
        client: AptosClient,
        senderAccount: AptosAccount,
        root: Buffer,
        contractAddress: string,
    ): Promise<void> {
        const tx = await client.generateTransaction(senderAccount.address(), {
            function: `${contractAddress}::merkle_tree::set_root`,
            type_arguments: [],
            arguments: [root]
        });

        await signAndSendTransaction(
            client,
            tx,
            senderAccount
        );
    }
    
    static async verify( 
        client: AptosClient,
        senderAccount: AptosAccount,
        proofs: Buffer[],
        params: Buffer,
        contractAddress: string,
    ): Promise<void> { 
        const tx = await client.generateTransaction(senderAccount.address(), { 
            function: `${contractAddress}::merkle_tree::verify`,
            type_arguments: [],
            arguments: [proofs,params]
        });

        await signAndSendTransaction( 
            client,
            tx,
            senderAccount
        );
    }
    

}