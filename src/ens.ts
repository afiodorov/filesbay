import { JsonRpcProvider } from "ethers";

export class EnsLooker {
  private cache: Map<string, string | null> = new Map();
  private provider: JsonRpcProvider;

  constructor() {
    this.provider = new JsonRpcProvider("https://eth.llamarpc.com");
  }

  async reverseLookup(address: string): Promise<string | null> {
    if (this.cache.has(address)) {
      return this.cache.get(address)!;
    }

    const res = await this.provider.lookupAddress(address);

    if (res) {
      this.cache.set(address, res);
    }

    return res;
  }
}
