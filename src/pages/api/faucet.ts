import type { NextApiRequest, NextApiResponse } from "next";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { MsgExecuteContract, SecretNetworkClient, Wallet } from "secretjs";
import moment from "moment";
import { env as serverEnv } from "../../env/server.mjs";
import { env as clientEnv } from "../../env/client.mjs";
import type { Extension } from "secretjs/dist/extensions/snip721/types.js";
import allMetadata from "../../data/all_metadata.json";

const collectionSize = 3261;

const getSecretClient = () => {
  const wallet = new Wallet(serverEnv.MNEMONIC);
  return new SecretNetworkClient({
    chainId: clientEnv.NEXT_PUBLIC_SECRET_CHAIN_ID,
    url: clientEnv.NEXT_PUBLIC_SECRET_REST_URL,
    wallet: wallet,
    walletAddress: wallet.address,
  });
};

const checkAddress = async (
  address: string,
  supabaseClient: SupabaseClient
) => {
  const { data, error } = await supabaseClient
    .from("faucet")
    .select()
    .eq("address", address);
  if (error) {
    console.error("Error checking address", error.message);
    throw new Error("Error checking address");
  }
  if (data[0] && data[0].created_at) {
    const createdAt: string = data[0].created_at as string;
    const days = moment().diff(moment(createdAt), "days");
    if (days < 1) {
      throw new Error("You may only use the faucet once every 24 hours.");
    }
  }
};

const checkTokenMinted = async (
  tokenId: string,
  supabaseClient: SupabaseClient
) => {
  const { data, error } = await supabaseClient
    .from("minted_tokens")
    .select()
    .eq("token_id", tokenId);
  if (error) {
    console.error("Error checking token", error.message);
    return true;
  }
  if (data[0] && data[0].token_id) {
    return true;
  }
  return false;
};

const faucet = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (clientEnv.NEXT_PUBLIC_SECRET_CHAIN_ID !== "pulsar-2") {
      throw new Error("Faucet is only available on testnet.");
    }
    const body: RequestBody = req.body as RequestBody;
    if (!body || !body.address) {
      throw new Error("Missing address");
    }
    const supabaseClient = createClient(
      serverEnv.SUPABASE_URL,
      serverEnv.SUPABASE_KEY
    );
    await checkAddress(body.address, supabaseClient);
    const secretClient = getSecretClient();
    // Mint tokens
    const mintMsgs: MintMsg[] = [];
    while (mintMsgs.length < 5) {
      const tokenId = Math.floor(Math.random() * collectionSize) + 1;
      if (!(await checkTokenMinted(tokenId.toString(), supabaseClient))) {
        const extension: Extension = allMetadata.find(
          (metadata) => metadata.id === tokenId.toString()
        ) as unknown as Extension;
        if (extension) {
          mintMsgs.push({
            token_id: tokenId.toString(),
            owner: body.address,
            public_metadata: {
              extension: extension,
            },
          });
        }
      }
    }
    const batchMintMsg = new MsgExecuteContract({
      sender: secretClient.address,
      contract_address: clientEnv.NEXT_PUBLIC_SECRET_CONTRACT_ADDRESS,
      code_hash: clientEnv.NEXT_PUBLIC_SECRET_CONTRACT_HASH,
      msg: { batch_mint_nft: { mints: mintMsgs } },
      sent_funds: [],
    });
    const batchMintTx = await secretClient.tx.broadcast([batchMintMsg], {
      gasLimit: 1_000_000,
    });
    if (batchMintTx.code !== 0) {
      console.log(batchMintTx);
      console.error("Error minting tokens", batchMintTx.rawLog);
      throw new Error("Error minting tokens");
    }
    // Update faucet DB
    const newRow = {
      address: body.address,
      created_at: moment(),
    };
    const { error: upsertError } = await supabaseClient
      .from("faucet")
      .upsert(newRow);
    if (upsertError) {
      console.error({ upsertError });
    }
    // Update minted tokens DB
    const mintedTokens = mintMsgs.map((msg) => ({
      token_id: msg.token_id,
    }));
    const { error: insertError } = await supabaseClient
      .from("minted_tokens")
      .insert(mintedTokens);
    if (insertError) {
      console.error({ insertError });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

type MintMsg = {
  token_id: string;
  owner: string;
  public_metadata: {
    extension: Extension;
  };
};

type RequestBody = {
  address: string;
};

export default faucet;
