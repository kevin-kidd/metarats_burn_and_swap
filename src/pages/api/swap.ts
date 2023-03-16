/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { env as clientEnv } from "../../env/client.mjs";
import { NextApiRequest, NextApiResponse } from "next";
import {
  DirectSecp256k1HdWallet,
  GasPrice,
  SigningCosmWasmClient,
  toUtf8,
} from "cosmwasm";
import { env as serverEnv } from "../../env/server.mjs";
import { Permit, SecretNetworkClient, Wallet } from "secretjs";
import pino from "pino";
import { createClient } from "@supabase/supabase-js";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { createWriteStream } from "pino-logflare";

import { LogflareUserOptionsI } from "logflare-transport-core";
interface Options extends LogflareUserOptionsI {
  size?: number;
}

const swap = async (req: NextApiRequest, res: NextApiResponse) => {
  const body: RequestBody = req.body as RequestBody;
  // create pino-logflare logger
  const logStream = createWriteStream({
    apiKey: serverEnv.LOGFLARE_API_KEY,
    sourceToken: serverEnv.LOGFLARE_SOURCE_TOKEN,
  } as Options);
  const logger = pino({}, logStream);
  try {
    if (!body || !body.secretAddress || !body.stargazeAddress || !body.permit) {
      throw new Error("Incorrect arguments provided.");
    }
    const stargazeClient = await getStargazeClient();
    const secretClient = getSecretClient();
    const supabaseClient = createClient(
      serverEnv.SUPABASE_URL,
      serverEnv.SUPABASE_KEY
    );
    // Get transaction history
    const txHistory: TransactionHistory =
      await secretClient.query.compute.queryContract({
        contract_address: clientEnv.NEXT_PUBLIC_SECRET_CONTRACT_ADDRESS,
        code_hash: clientEnv.NEXT_PUBLIC_SECRET_CONTRACT_HASH,
        query: {
          with_permit: {
            permit: body.permit,
            query: {
              transaction_history: {
                address: body.secretAddress,
                page_size: 300,
              },
            },
          },
        },
      });
    if (txHistory.transaction_history.txs.length === 0) {
      throw new Error(
        `Transaction history for address ${body.secretAddress} is empty.`
      );
    }
    const burnTxs = txHistory.transaction_history.txs.filter((transaction) =>
      transaction.action.hasOwnProperty("burn")
    );
    if (burnTxs.length === 0) {
      throw new Error(
        "Did not find any burn transactions for address " + body.secretAddress
      );
    }
    // Check which tokens have not been swapped in DB
    const { data, error } = await supabaseClient
      .from("swapped_tokens")
      .select()
      .filter(
        "token_id",
        "in",
        `(${burnTxs.map((tx) => JSON.stringify(tx.token_id)).join()})`
      );
    if (error) throw new Error("Failed to check database for tokens.");
    const eligibleTokens = burnTxs
      .map((tx) => tx.token_id)
      .filter(
        (tokenId) => !data.some((row) => row.token_id === parseInt(tokenId))
      );
    if (eligibleTokens.length === 0) {
      throw new Error("No eligible tokens found for " + body.secretAddress);
    }
    // Mint the new tokens on Stargaze
    const mintMsgs = [];
    for (const tokenId of eligibleTokens) {
      mintMsgs.push({
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          sender: clientEnv.NEXT_PUBLIC_STARGAZE_BACKEND_ADDRESS,
          contract: clientEnv.NEXT_PUBLIC_STARGAZE_MINTER,
          msg: toUtf8(
            JSON.stringify({
              mint_for: {
                token_id: Number(tokenId),
                recipient: body.stargazeAddress,
              },
            })
          ),
          funds: [],
        }),
      });
    }
    const tx = await stargazeClient.signAndBroadcast(
      clientEnv.NEXT_PUBLIC_STARGAZE_BACKEND_ADDRESS,
      mintMsgs,
      "auto"
    );
    if (tx.code !== 0) {
      throw new Error(
        `Failed to mint tokens for address ${body.stargazeAddress}`
      );
    }
    // Add to database
    const { error: insertError } = await supabaseClient
      .from("swapped_tokens")
      .insert(
        eligibleTokens.map((tokenId) => ({
          token_id: tokenId,
          address: body.secretAddress,
        }))
      );
    if (insertError) {
      logger.error(
        `Error inserting tokens in to the DB for ${body.secretAddress}`
      );
    }
    const tokensChild = logger.child(eligibleTokens);
    tokensChild.info(
      `Successfully swapped tokens for address ${body.secretAddress}`,
      {
        eligibleTokens,
      }
    );
    // Return all newly minted tokens
    return res.status(200).json({ tokens: eligibleTokens });
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal server error";
    logger.error(
      errorMsg,
      `Error swapping tokens for address ${body.secretAddress}`
    );
    return res.status(500).send(errorMsg);
  }
};

const getStargazeClient = async () => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    serverEnv.MNEMONIC,
    {
      prefix: "stars",
    }
  );
  return await SigningCosmWasmClient.connectWithSigner(
    clientEnv.NEXT_PUBLIC_STARGAZE_RPC_URL,
    wallet,
    {
      gasPrice: GasPrice.fromString("0ustars"),
    }
  );
};

const getSecretClient = () => {
  const wallet = new Wallet(serverEnv.MNEMONIC);
  return new SecretNetworkClient({
    chainId: clientEnv.NEXT_PUBLIC_SECRET_CHAIN_ID,
    url: clientEnv.NEXT_PUBLIC_SECRET_REST_URL,
    wallet: wallet,
    walletAddress: wallet.address,
  });
};

type TransactionHistory = {
  transaction_history: {
    total: number;
    txs: Array<{
      tx_id: number;
      block_height: number;
      token_id: string;
      action:
        | {
            transfer: {
              from: string;
              sender: string;
              recipient: string;
            };
          }
        | {
            mint: {
              minter: string;
              recipient: string;
            };
          }
        | {
            burn: {
              owner: string;
              burner: string;
            };
          };
    }>;
  };
};

type RequestBody = {
  secretAddress: string;
  stargazeAddress: string;
  permit: Permit;
};

export default swap;
