
// const checkTokenMinted = async (
//   tokenId: string,
//   supabaseClient: SupabaseClient,
//   stargazeClient: SigningCosmWasmClient
// ) => {
//   // Check supabase DB
//   const { data, error } = await supabaseClient
//     .from("minted_tokens")
//     .select()
//     .eq("token_id", tokenId);
//   if (error) {
//     console.error("Error checking token", error.message);
//     return { error: "Error checking token" };
//   }
//   if (data[0] && data[0].token_id) {
//     return { error: "Token already minted" };
//   }
//   // Check stargaze contract
//   const tokenInfo = await stargazeClient.queryContractSmart(
//     clientEnv.NEXT_PUBLIC_STARGAZE_SG721,
//     {
//       nft_info: {
//         token_id: tokenId,
//       },
//     }
//   );
//   console.log(tokenInfo);
//   return { success: true };
// };

   // Check token minted
//    const { error: mintedError, success: mintedSuccess } =
//    await checkTokenMinted(body.tokenId, supabaseClient, stargazeClient);
//  if (mintedError || !mintedSuccess) {
//    return res.status(400).json({ error: mintedError });
//  }

// if (
//    !(await checkTokenReceived(
//      body.tokenId,
//      body.address,
//      secretClient,
//      permit
//    ))
//  ) {
//    return res.status(400).json({ error: "Invalid token" });
//  }


 // Mint token to address
//  const mintMsg = {
//    mint_to: {
//      token_id: body.tokenId,
//      owner: body.address,
//    },
//  };
//  const tx = await stargazeClient.signAndBroadcast(
//    stargazeAddress,
//    [mintMsg],
//    clientEnv.NEXT_PUBLIC_STARGAZE_MINTER,
//    "auto"
//  );
//  if (tx.code !== 0) {
//    console.error(`Failed to mint token ${body.tokenId}`, tx);
//    return res.status(500).json({ error: "Internal server error" });
//  }

// const checkTokenReceived = async (
//    tokenId: string,
//    address: string,
//    client: SecretNetworkClient,
//    permit: Permit
//  ) => {
//    // Query the token transfer history
//    const transactionHistory: TransactionHistoryResponse =
//      await client.query.compute.queryContract({
//        contract_address: clientEnv.NEXT_PUBLIC_SECRET_CONTRACT_ADDRESS,
//        code_hash: clientEnv.NEXT_PUBLIC_SECRET_CONTRACT_HASH,
//        query: {
//          with_permit: {
//            query: {
//              transaction_history: {
//                address: client.address,
//                page_size: 30,
//              },
//            },
//            permit: permit,
//          },
//        },
//      });
//    if (transactionHistory.transaction_history.txs.length > 0) {
//      const transactions = transactionHistory.transaction_history.txs as Tx[];
//      if (
//        transactions.some((transaction: Tx) => {
//          const transferDetails: TransferType =
//            transaction.action as TransferType;
//          if (
//            transferDetails.transfer &&
//            transferDetails.transfer.from === address
//          ) {
//            return transaction.token_id === tokenId;
//          }
//          return false;
//        })
//      ) {
//        return true;
//      } else {
//        console.error(
//          `Address does not match (${address})`,
//          transactionHistory.transaction_history.txs
//        );
//      }
//    } else {
//      return false;
//    }
//  };

// const permit = await secretClient.utils.accessControl.permit.sign(
//    secretClient.address,
//    clientEnv.NEXT_PUBLIC_SECRET_CHAIN_ID,
//    "Faucet Collection",
//    [clientEnv.NEXT_PUBLIC_SECRET_CONTRACT_ADDRESS],
//    ["owner"],
//    false
//  );


// const getStargazeClient = async () => {
//    const wallet = await Secp256k1HdWallet.fromMnemonic(serverEnv.MNEMONIC);
//    const address = (await wallet.getAccounts())[0]?.address;
//    if (!address) {
//      throw new Error("Failed to connect to the Stargaze chain.");
//    }
//    return {
//      stargazeClient: await SigningCosmWasmClient.connectWithSigner(
//        clientEnv.NEXT_PUBLIC_STARGAZE_RPC_URL,
//        wallet
//      ),
//      stargazeAddress: address,
//    };
//  };

// type TransferType = {
//    transfer: {
//      from: string;
//      sender: string;
//      recipient: string;
//    };
//  };
 
//  interface Tx extends RichTx {
//    token_id: string;
//  }