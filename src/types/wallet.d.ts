import type { Permit, SecretNetworkClient } from "secretjs";

export interface WalletState {
  client: {
    value: SecretNetworkClient | null;
    set: (client: SecretNetworkClient) => void;
  };
  address: {
    value: string | null;
    set: (address: string) => void;
  };
  permit: {
    value: Permit | null;
    set: (permit: Permit) => void;
  };
}
