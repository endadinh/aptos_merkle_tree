module DagoraLaunchpad::Merkle_tree{


    use std::vector;
    use std::error;
    use std::signer;
    use aptos_std::aptos_hash;
    
    /// Dagora Launchpad: Merkle Root Equal
    const EQUAL:u8 = 0;
    /// Dagora Launchpad: Merkle Bigger
    const BIGGER:u8 = 1;
    /// Dagora Launchpad: Merkle Smaller
    const SMALLER:u8 = 2;
    /// Dagora Launchpad: Merkle Verify Failed
    const ERR_VERIFY_FAILED:u64 = 0;
    /// Dagora Launchpad: Merkle No Authorization
    const NO_AUTHORIZATION:u64 = 1;
    /// Dagora Launchpad: Merkle Root Unexisted
    const ROOT_UNEXISTED:u64 = 2;
    /// Dagora Launchpad: Merkle Length invalid
    const LENGTH_INVALID:u64 = 3;

    struct Code has key { 
        code: u8
    }

    struct Compute has key { 
        hash: vector<u8>
    }

    fun extract_vector(vec:vector<u8>,start:u64,end:u64):vector<u8>{
        let result = vector::empty<u8>();
        let len = vector::length(&vec);

        assert!(start <= end && end <= len,error::out_of_range(1));
        let index = start;
        while(index < end){
            vector::push_back(&mut result,*vector::borrow(&vec,index));
            index = index + 1;
        };
        result
    }

    fun hashPair(a:vector<u8>,b:vector<u8>):vector<u8>{
        if(compare_vector(&a,&b)==SMALLER){
            vector::append(&mut a,b);
            aptos_hash::keccak256(a)
        }else{
            vector::append(&mut b,a);
            aptos_hash::keccak256(b)
        }
    }

    // fun processProof(proof: vector<vector<u8>>,leaf:vector<u8>):vector<u8>{
    //     assert!(vector::length(&proof)%32==0,error::invalid_argument(LENGTH_INVALID));
    //     let deep = vector::length(&proof)/32;
    //     assert!(vector::length(&leaf)==32,error::invalid_argument(LENGTH_INVALID));
    //     let node = leaf;
    //     let index = 0;
    //     while(index < deep){
    //         node = hashPair(node,extract_vector(proof,index*32,index*32+32));
    //         index = index +1;
    //     };
    //     node
    // }

    fun compare_vector(a:&vector<u8>,b:&vector<u8>):u8{
        let len = vector::length(a);
        assert!(vector::length(b)==len,error::invalid_argument(LENGTH_INVALID));
        let index = 0;
        while(index < len){
            if(*vector::borrow(a,index) > *vector::borrow(b,index)){
                return BIGGER
            };
            if(*vector::borrow(a,index) < *vector::borrow(b,index)){
                return SMALLER
            };
            index = index +1;
        };
        EQUAL
    }

    public entry fun verify(user: &signer,proof: vector<vector<u8>>, leaf:vector<u8> , root: vector<u8>) {
        // assert!(compare_vector(&processProof(proof,leaf),&root)==EQUAL,error::invalid_argument(VERIFY_FAILED));
        let computedHash = processProof(proof, leaf);
        let compared = compare_vector(&computedHash, &root);
        move_to(user, Code {code : compared});
        assert!(compared == EQUAL, error::invalid_argument(ERR_VERIFY_FAILED));
    }

    public entry fun save(user: &signer,proof: vector<vector<u8>>, leaf:vector<u8> , root: vector<u8>) {
        // assert!(compare_vector(&processProof(proof,leaf),&root)==EQUAL,error::invalid_argument(VERIFY_FAILED));
        let computedHash = processProof(proof, leaf);
        let compared = compare_vector(&computedHash, &root);
        move_to(user, Code {code : compared});
    }

    fun processProof(proof: vector<vector<u8>>, leaf: vector<u8> ): vector<u8> {
        let proof_len = vector::length(&proof);
        let computedHash = leaf;
        let index = 0;
        while(index < proof_len) { 
            computedHash = hashPair(computedHash, *vector::borrow(&proof, index));
            index = index + 1;
        };
        computedHash
    }

    public entry fun save_compute(user: &signer, proof: vector<vector<u8>>, leaf: vector<u8> ){
        let proof_len = vector::length(&proof);
        let computedHash = leaf;
        let index = 0;
        while(index < proof_len) { 
            computedHash = hashPair(computedHash, *vector::borrow(&proof, index));
            index = index + 1;
        };
        move_to(user, Compute {hash : computedHash});
    }
}