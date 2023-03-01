import { Button } from "@chakra-ui/react";
import classNames from "classnames";
import { useState } from "react";
import { SecretNetworkClient } from "secretjs";
import { useToast } from "@chakra-ui/react";
import { env } from "../env/client.mjs";
import { useWalletStore } from "../stores/walletStore";

export const ConnectCard = () => {
  const { address, client, permit } = useWalletStore((state) => state);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const connect = async () => {
    try {
      setLoading(true);
      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      while (
        !window.keplr ||
        !window.getEnigmaUtils ||
        !window.getOfflineSignerOnlyAmino
      ) {
        await sleep(50);
      }
      // Get stargaze info
      await window.keplr.enable(env.NEXT_PUBLIC_STARGAZE_CHAIN_ID);
      const stargazeOfflineSigner = window.keplr.getOfflineSignerOnlyAmino(
        env.NEXT_PUBLIC_STARGAZE_CHAIN_ID
      );
      const stargazeAccounts = await stargazeOfflineSigner.getAccounts();
      const stargazeAddress = stargazeAccounts[0]?.address as string;
      if (!stargazeAddress) {
        throw new Error("Failed to grab Secret address from Keplr!");
      }
      // Get Secret info
      await window.keplr.enable(env.NEXT_PUBLIC_SECRET_CHAIN_ID);
      const secretOfflineSigner = window.keplr.getOfflineSignerOnlyAmino(
        env.NEXT_PUBLIC_SECRET_CHAIN_ID
      );
      const secretAccounts = await secretOfflineSigner.getAccounts();
      const secretAddress = secretAccounts[0]?.address as string;
      if (!secretAddress) {
        throw new Error("Failed to grab Secret address from Keplr!");
      }
      const secretjs = new SecretNetworkClient({
        url: env.NEXT_PUBLIC_SECRET_REST_URL,
        chainId: env.NEXT_PUBLIC_SECRET_CHAIN_ID,
        wallet: secretOfflineSigner,
        walletAddress: secretAddress,
        encryptionUtils: window.keplr.getEnigmaUtils(
          env.NEXT_PUBLIC_SECRET_CHAIN_ID
        ),
      });
      // Get permit
      const newPermit = await secretjs.utils.accessControl.permit.sign(
        secretAddress,
        env.NEXT_PUBLIC_SECRET_CHAIN_ID,
        "MetaRats Burn & Swap",
        [env.NEXT_PUBLIC_SECRET_CONTRACT_ADDRESS],
        ["owner"],
        true
      );
      permit.set(newPermit);
      address.set({
        secret: secretAddress,
        stargaze: stargazeAddress,
      });
      client.set(secretjs);
      // Post to faucet API with address and display toast if there's an error caught
      const response = await fetch("/api/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secretAddress: secretAddress,
          stargazeAddress: stargazeAddress,
        }),
      });
      if (response.ok) {
        const { tokens }: { tokens: string[] } = (await response.json()) as {
          tokens: string[];
        };
        if (tokens.length !== 0) {
          toast({
            description: `${tokens.length} burned Rats were discovered and sent to your Stargaze wallet!`,
            status: "info",
          });
        }
      }
    } catch (error) {
      console.error(error);
      let errorMsg = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      toast({
        description: errorMsg,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
    setLoading(false);
  };
  return (
    <div
      className={classNames(
        "rounded-md border-2 border-teal-blue bg-dark-blue/80 backdrop-blur",
        "flex w-full max-w-md flex-col items-center justify-center p-6 text-white"
      )}
    >
      <p className="mb-6 px-6 text-center font-semibold">
        Please connect your wallet to begin swapping your MetaRats from Secret
        Network to Stargaze.
      </p>
      <Button
        variant="outline"
        size="lg"
        colorScheme="teal"
        onClick={() => {
          void connect();
        }}
        isLoading={loading}
      >
        Connect to Keplr
      </Button>
    </div>
  );
};
