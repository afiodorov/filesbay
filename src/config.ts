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
  rpcURL: "http://127.0.0.1:4000",
  contractAddress: "0xD34De1F7444C7Be9e7D6A72F4ab9D0a375527809",
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
