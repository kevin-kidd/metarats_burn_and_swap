import { useQuery } from "react-query";
import { env } from "../env/client.mjs";
import { useWalletStore } from "../stores/walletStore";

export const useInventory = () => {
  const { address, client, permit } = useWalletStore((state) => state);
  return useQuery(["inventory"], async () => {
    if (!client.value) throw new Error("Failed to connect to wallet");
    if (!permit.value) throw new Error("Failed to get permit");
    if (!address.value.secret) throw new Error("Failed to get address");
    const inventory = await client.value.query.snip721.GetOwnedTokens({
      contract: {
        address: env.NEXT_PUBLIC_SECRET_CONTRACT_ADDRESS,
        codeHash: env.NEXT_PUBLIC_SECRET_CONTRACT_HASH,
      },
      auth: {
        permit: permit.value,
      },
      owner: address.value.secret,
    });
    return inventory.token_list.tokens;
  });
};
