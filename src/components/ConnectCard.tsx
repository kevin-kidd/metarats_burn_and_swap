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
    let secretAddress, stargazeAddress, newPermit;
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
      if (env.NEXT_PUBLIC_SECRET_CHAIN_ID === "pulsar-2") {
        await window.keplr.experimentalSuggestChain({
          chainId: env.NEXT_PUBLIC_SECRET_CHAIN_ID,
          chainName: "Secret Pulsar Testnet",
          rpc: env.NEXT_PUBLIC_SECRET_RPC_URL,
          rest: env.NEXT_PUBLIC_SECRET_REST_URL,
          bip44: {
            coinType: 529,
          },
          bech32Config: {
            bech32PrefixAccAddr: "secret",
            bech32PrefixAccPub: "secret" + "pub",
            bech32PrefixValAddr: "secret" + "valoper",
            bech32PrefixValPub: "secret" + "valoperpub",
            bech32PrefixConsAddr: "secret" + "valcons",
            bech32PrefixConsPub: "secret" + "valconspub",
          },
          currencies: [
            {
              coinDenom: "SCRT",
              coinMinimalDenom: "uscrt",
              coinDecimals: 6,
            },
          ],
          feeCurrencies: [
            {
              coinDenom: "SCRT",
              coinMinimalDenom: "uscrt",
              coinDecimals: 6,
            },
          ],
          stakeCurrency: {
            coinDenom: "SCRT",
            coinMinimalDenom: "uscrt",
            coinDecimals: 6,
          },
          coinType: 529,
        });
      }
      // Get stargaze info
      await window.keplr.enable(env.NEXT_PUBLIC_STARGAZE_CHAIN_ID);
      const stargazeOfflineSigner = window.keplr.getOfflineSignerOnlyAmino(
        env.NEXT_PUBLIC_STARGAZE_CHAIN_ID
      );
      const stargazeAccounts = await stargazeOfflineSigner.getAccounts();
      stargazeAddress = stargazeAccounts[0]?.address as string;
      if (!stargazeAddress) {
        throw new Error("Failed to grab Secret address from Keplr!");
      }
      // Get Secret info
      await window.keplr.enable(env.NEXT_PUBLIC_SECRET_CHAIN_ID);
      const secretOfflineSigner = window.keplr.getOfflineSignerOnlyAmino(
        env.NEXT_PUBLIC_SECRET_CHAIN_ID
      );
      const secretAccounts = await secretOfflineSigner.getAccounts();
      secretAddress = secretAccounts[0]?.address as string;
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
      newPermit = await secretjs.utils.accessControl.permit.sign(
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
    try {
      const toastId = toast({
        description: "Checking for burned Rats...",
        id: "burned-rats",
        status: "loading",
        duration: 5000,
        isClosable: false,
      });
      // Check if any burned tokens
      const response = await fetch("/api/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secretAddress,
          stargazeAddress,
          permit: newPermit,
        }),
      });
      if (response.ok) {
        const { tokens }: { tokens: string[] } = (await response.json()) as {
          tokens: string[];
        };
        if (tokens.length > 0) {
          toast.update(toastId, {
            description: `${tokens.length} burned Rats were discovered and sent to your Stargaze wallet!`,
            status: "info",
            duration: 9000,
            isClosable: true,
          });
        }
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error(error);
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
