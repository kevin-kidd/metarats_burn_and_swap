/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CosmWasmClient } from "cosmwasm";
import { env } from "../env/client.mjs";
import { useQuery } from "react-query";

export const useTotalBurned = () => {
  return useQuery(["total-burned"], async () => {
    const client = await CosmWasmClient.connect(
      env.NEXT_PUBLIC_STARGAZE_RPC_URL
    );

    const totalBurned = (await client.queryContractSmart(
      env.NEXT_PUBLIC_STARGAZE_SG721,
      {
        num_tokens: {},
      }
    )) as { count: number };
    return totalBurned.count;
  });
};
