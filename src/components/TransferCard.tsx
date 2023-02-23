import { Button, useToast } from "@chakra-ui/react";
import classNames from "classnames";
import { useInventory } from "../hooks/useInventory";
import { useWalletStore } from "../stores/walletStore";

export const TransferCard = () => {
  const address = useWalletStore((state) => state.address.value);
  const { data: inventory, isError, isLoading } = useInventory();
  const toast = useToast();
  const handleFaucetRequest = async () => {
    if (!address) {
      toast({
        description: "Failed to grab your Secret address.",
        status: "error",
        duration: 9000,
        isClosable: true,
        id: "faucet-toast",
      });
      return;
    }
    const toastId = toast({
      description: "Requesting NFTs from the faucet..",
      id: "faucet-toast",
      status: "loading",
      isClosable: false,
    });
    try {
      // Post to faucet API with address and display toast if there's an error caught
      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const toastUpdate = {
        description: "Faucet request successful!",
        id: "faucet-toast",
        status: "success" as const,
        duration: 9000,
        isClosable: true,
      };
      toast.update(toastId, toastUpdate);
    } catch (error: unknown) {
      console.error(error);
      let errorMsg = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      toast.update(toastId, {
        description: errorMsg,
        id: "faucet-toast",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };
  return (
    <div
      className={classNames(
        "rounded-md border-2 border-teal-blue bg-dark-blue/80 backdrop-blur",
        "relative flex w-full max-w-md flex-col items-center justify-center p-6 text-white"
      )}
    >
      <button
        className="absolute bottom-1 right-2 text-gray-500 transition duration-150 ease-in-out hover:text-gray-200"
        onClick={() => {
          if (!toast.isActive("faucet-toast")) {
            void handleFaucetRequest();
          }
        }}
      >
        Faucet
      </button>
      <h1 className="mb-6 text-xl">
        You have{" "}
        <span className="font-semibold text-teal-500">
          {isLoading
            ? "..."
            : isError
            ? "N/A"
            : inventory
            ? inventory.length
            : "0"}
        </span>{" "}
        MetaRats available to swap
      </h1>
      <Button
        variant="outline"
        size="lg"
        colorScheme="teal"
        className="mb-6"
        isDisabled={isLoading || !inventory || inventory.length <= 0}
      >
        Begin Swapping
      </Button>
      <span className="absolute left-1 bottom-1 text-xs">{address}</span>
    </div>
  );
};
