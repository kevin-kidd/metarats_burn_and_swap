import type { Permit, SecretNetworkClient } from "secretjs";

export interface WalletState {
  client: {
    value: SecretNetworkClient | null;
    set: (client: SecretNetworkClient) => void;
  };
  address: {
    value: {
      secret: string | null;
      stargaze: string | null;
    };
    set: (addresses: {
      secret: string | null;
      stargaze: string | null;
    }) => void;
  };
  permit: {
    value: Permit | null;
    set: (permit: Permit) => void;
  };
}
