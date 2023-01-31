import type { SecretNetworkClient } from "secretjs";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { WalletState } from "../types/wallet";

export const useWalletStore = create<WalletState>()(
  immer((set) => ({
    client: {
      value: null,
      set: (client: SecretNetworkClient) =>
        set((state) => {
          state.client.value = client;
        }),
    },
    address: {
      value: null,
      set: (address) =>
        set((state) => {
          state.address.value = address;
        }),
    },
    permit: {
      value: null,
      set: (permit) =>
        set((state) => {
          state.permit.value = permit;
        }),
    },
  }))
);
