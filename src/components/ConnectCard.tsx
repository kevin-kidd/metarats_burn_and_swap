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
      const CHAIN_ID = env.NEXT_PUBLIC_SECRET_CHAIN_ID;
      await window.keplr.enable(CHAIN_ID);
      const keplrOfflineSigner =
        window.keplr.getOfflineSignerOnlyAmino(CHAIN_ID);
      const accounts = await keplrOfflineSigner.getAccounts();
      const myAddress = accounts[0]?.address as string;
      if (!myAddress) {
        console.error("Failed to grab address from Keplr!");
        return;
      }
      const secretjs = new SecretNetworkClient({
        url: "https://lcd.secret.express/",
        chainId: CHAIN_ID,
        wallet: keplrOfflineSigner,
        walletAddress: myAddress,
        encryptionUtils: window.keplr.getEnigmaUtils(CHAIN_ID),
      });
      // Get permit
      const newPermit = await secretjs.utils.accessControl.permit.sign(
        myAddress,
        CHAIN_ID,
        "MetaRats Burn & Swap",
        [env.NEXT_PUBLIC_SECRET_CONTRACT_ADDRESS],
        ["owner"],
        true
      );
      permit.set(newPermit);
      address.set(myAddress);
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
