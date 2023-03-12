import type { Permit, SecretNetworkClient } from "secretjs";

export interface WalletState {
  client: {
    value: SecretNetworkClient | null;
    set: (client: SecretNetworkClient) => void;
  };
  address: {
    value: {
      secret?: string;
      stargaze?: string;
    };
    set: (addresses: { secret: string; stargaze: string }) => void;
  };
  permit: {
    value: Permit | null;
    set: (permit: Permit) => void;
  };
}
