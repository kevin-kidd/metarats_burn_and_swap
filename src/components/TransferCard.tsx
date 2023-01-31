import { Button } from "@chakra-ui/react";
import classNames from "classnames";
import { useInventory } from "../hooks/useInventory";
import { useWalletStore } from "../stores/walletStore";

export const TransferCard = () => {
  const address = useWalletStore((state) => state.address.value);
  const { data: inventory, isError, isLoading } = useInventory();
  return (
    <div
      className={classNames(
        "rounded-md border-2 border-teal-blue bg-dark-blue/80 backdrop-blur",
        "relative flex w-full max-w-md flex-col items-center justify-center p-6 text-white"
      )}
    >
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
