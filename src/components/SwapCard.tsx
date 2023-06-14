import { Button, useToast } from "@chakra-ui/react";
import classNames from "classnames";
import Image from "next/image";
import { env } from "../env/client.mjs";
import { useInventory } from "../hooks/useInventory";
import { useWalletStore } from "../stores/walletStore";
import images from "../data/images.json";
import { BiLinkExternal } from "react-icons/bi";
import Link from "next/link";
import { InstructionsCard } from "./InstructionsCard";
import { clientEnv } from "../env/schema.mjs";

export const SwapCard = () => {
  const {
    address: {
      value: { secret: secretAddress, stargaze: stargazeAddress },
    },
    client,
    permit,
    burnedTokens,
    swappedTokens,
  } = useWalletStore((state) => state);
  const { data: inventory, isError, isLoading, refetch } = useInventory();
  const toast = useToast();
  const handleFaucetRequest = async () => {
    if (!secretAddress || !client) {
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
      duration: null,
      isClosable: false,
    });
    try {
      // Post to faucet API with address and display toast if there's an error caught
      const response = await fetch("/api/faucet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: secretAddress }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      toast.update(toastId, {
        description: "Faucet request successful!",
        status: "success" as const,
        duration: 9000,
        isClosable: true,
      });
      await refetch();
    } catch (error: unknown) {
      console.error(error);
      let errorMsg = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      toast.update(toastId, {
        description: errorMsg,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };
  const handleSwap = async () => {
    if (!inventory || !secretAddress || !stargazeAddress || !client) {
      toast({
        description: "Failed to grab your address.",
        status: "error",
        duration: 9000,
        isClosable: true,
        id: "burn-toast",
      });
      return;
    }
    const toastId = toast({
      description: "Burning MetaRats..",
      id: "burn-toast",
      status: "loading",
      duration: null,
      isClosable: false,
    });
    try {
      const burnTx = await client.value?.tx.compute.executeContract(
        {
          sender: secretAddress,
          contract_address: env.NEXT_PUBLIC_SECRET_CONTRACT_ADDRESS,
          code_hash: env.NEXT_PUBLIC_SECRET_CONTRACT_HASH,
          msg: {
            batch_burn_nft: {
              burns: [{ token_ids: inventory }],
            },
          },
        },
        {
          gasLimit: 500_000,
        }
      );
      if (burnTx?.code === 0) {
        toast.update(toastId, {
          description:
            inventory.length.toString() +
            " MetaRats burned! Swapping to Stargaze...",
          status: "loading",
          duration: null,
          isClosable: true,
        });
        burnedTokens.set(inventory);
        const response = await fetch("/api/swap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            secretAddress,
            stargazeAddress,
            permit: permit.value,
          }),
        });
        if (response.ok) {
          const { tokens }: { tokens: string[] } = (await response.json()) as {
            tokens: string[];
          };
          swappedTokens.set(tokens);
          toast.update(toastId, {
            description: "Swap successful!",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
        } else {
          throw new Error(await response.text());
        }
      } else if (burnTx?.rawLog.includes("out of gas")) {
        toast.update(toastId, {
          description: "You do not have enough $SCRT for the gas fees.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast.update(toastId, {
          description: "An unexpected error occurred. Please try again.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error: unknown) {
      let errorMsg = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      toast.update(toastId, {
        description: errorMsg,
        status: "error",
        duration: 20000,
        isClosable: true,
      });
    }
  };
  return (
    <>
      <div
        className={classNames(
          "rounded-md border-2 border-teal-blue bg-dark-blue/80 backdrop-blur",
          "relative flex w-fit max-w-xl flex-col items-center justify-center py-8 px-6 text-white sm:px-12 lg:px-16"
        )}
      >
        {burnedTokens.value.length <= 0 && (
          <>
            {clientEnv.NEXT_PUBLIC_SECRET_CHAIN_ID === "pulsar-2" && (
              <button
                className="absolute bottom-1 left-2 text-gray-500 transition duration-150 ease-in-out hover:text-gray-200"
                onClick={() => {
                  if (!toast.isActive("faucet-toast")) {
                    void handleFaucetRequest();
                  }
                }}
              >
                Faucet
              </button>
            )}

            <h1 className="mb-6 text-center text-lg sm:text-xl">
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
              onClick={() => void handleSwap()}
              isDisabled={isLoading || !inventory || inventory.length <= 0}
            >
              Begin Swapping
            </Button>
          </>
        )}
        {burnedTokens.value.length > 0 && (
          <>
            <button
              onClick={() => {
                burnedTokens.set([]);
                swappedTokens.set([]);
              }}
              className="absolute bottom-1 left-1 text-sm font-semibold"
            >
              ← Go Back
            </button>
            <div className="max-h-96 w-full overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-teal-blue">
                  <tr className="text-left text-sm font-semibold text-white">
                    <th scope="col" className="py-3.5 pl-4">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5">
                      Link
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/20 bg-white/20">
                  {(swappedTokens.value.length > 0
                    ? swappedTokens.value
                    : burnedTokens.value
                  )?.map((tokenId) => (
                    <tr key={tokenId}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <Image
                              className="ml-2 h-10 w-10 rounded-full"
                              width={50}
                              height={50}
                              src={
                                images.find(
                                  (image: { tokenId: string; url: string }) =>
                                    image.tokenId === tokenId
                                )?.url ?? ""
                              }
                              alt=""
                            />
                          </div>
                          <div className="ml-4 font-medium text-gray-100">
                            MetaRat #{tokenId}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={classNames(
                            "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                            burnedTokens.value.includes(tokenId)
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-500"
                          )}
                        >
                          {swappedTokens.value.length > 0
                            ? "Swapped"
                            : "Burned"}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={
                            burnedTokens.value.includes(tokenId)
                              ? `${env.NEXT_PUBLIC_STARGAZE_MARKETPLACE_URL}/media/${env.NEXT_PUBLIC_STARGAZE_SG721}/${tokenId}`
                              : "#"
                          }
                          target={
                            burnedTokens.value.includes(tokenId) ? "_blank" : ""
                          }
                          className={classNames(
                            "flex items-center gap-1 whitespace-nowrap px-3 py-4 text-sm",
                            burnedTokens.value.includes(tokenId)
                              ? "text-purple-500"
                              : "text-gray-300 hover:cursor-not-allowed"
                          )}
                        >
                          View on Stargaze <BiLinkExternal />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <span className="absolute right-1 bottom-1 text-xs">
          {secretAddress}
        </span>
      </div>
      {burnedTokens.value.length === 0 && swappedTokens.value.length === 0 && (
        <InstructionsCard />
      )}
    </>
  );
};
