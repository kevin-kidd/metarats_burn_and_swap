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
      value: {
        secret: null,
        stargaze: null,
      },
      set: (addresses) =>
        set((state) => {
          state.address.value = addresses;
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
