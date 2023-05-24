import React, { useState } from "react";
import { defaultChain, Config, Env } from "./config";

function shortenAddress(address: string): string {
  const digits = 4;

  return address.slice(0, digits + 2) + "..." + address.slice(-digits);
}

export type ctx = {
  address: string | null;
  setAddress: React.Dispatch<React.SetStateAction<string | null>>;
  shortenAddress: typeof shortenAddress;
  config: Env;
  setConfig: React.Dispatch<React.SetStateAction<Env>>;
};

export const EthContext = React.createContext<ctx | null>(null);

interface Props {
  children: React.ReactNode;
}

export const EthContextProvider: React.FC<Props> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [config, setConfig] = useState<Env>(Config.get(defaultChain)!);

  return (
    <EthContext.Provider
      value={{ address, setAddress, shortenAddress, config, setConfig }}
    >
      {children}
    </EthContext.Provider>
  );
};
