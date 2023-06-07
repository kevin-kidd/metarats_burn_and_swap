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
    burnedTokens: {
      value: [],
      set: (tokens: string[]) =>
        set((state) => {
          state.burnedTokens.value = tokens;
        }),
    },
    swappedTokens: {
      value: [],
      set: (tokens: string[]) =>
        set((state) => {
          state.swappedTokens.value = tokens;
        }),
    },
    address: {
      value: {},
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
