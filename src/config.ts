interface PriceToken {
  address: string;
  symbol: string;
  decimals: number;
}

export interface Env {
  rpcURL: string;
  contractAddress: string;
  chainID: string;
  priceTokens: PriceToken[];
}

export const Config: Map<string, Env> = new Map();

Config.set("0x2a", {
  rpcURL: "http://localhost:8545",
  contractAddress: "0xC11B5E62c7bCE6396C82fBD9830DC98A8c39b7DB",
  chainID: "0x2a",
  priceTokens: [
    {
      address: "0xC0F4434F015522a7A5250CA78c142bfaa6033853",
      symbol: "TKN",
      decimals: 18,
    },
  ],
});

export const defaultChain = "0x2a";
