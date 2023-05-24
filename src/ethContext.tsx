import {
  AbstractProvider,
  BigNumberish,
  formatUnits,
  JsonRpcProvider,
} from "ethers";
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
  provider: AbstractProvider;
  setProvider: React.Dispatch<React.SetStateAction<AbstractProvider>>;
  formatPrice: Map<string, (_: BigNumberish) => string>;
  namePrice: Map<string, string>;
};

export const EthContext = React.createContext<ctx | null>(null);

interface Props {
  children: React.ReactNode;
}

export const EthContextProvider: React.FC<Props> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [config, setConfig] = useState<Env>(Config.get(defaultChain)!);
  const [provider, setProvider] = useState<AbstractProvider>(
    new JsonRpcProvider(config.rpcURL)
  );

  const formatPrice = new Map<string, (_: BigNumberish) => string>();
  const namePrice = new Map<string, string>();

  config.priceTokens.forEach((val) => {
    formatPrice.set(val.address, (value) => {
      return formatUnits(value, val.decimals);
    });
    namePrice.set(val.address, val.symbol);
  });

  return (
    <EthContext.Provider
      value={{
        address,
        setAddress,
        shortenAddress,
        config,
        setConfig,
        provider,
        setProvider,
        formatPrice,
        namePrice,
      }}
    >
      {children}
    </EthContext.Provider>
  );
};
