import { MessageKit } from "@nucypher/nucypher-ts";

import {
  ConditionSet,
  Conditions,
  DeployedStrategy,
  PolicyMessageKit,
} from "@nucypher/nucypher-ts";
import strategy from "./nucypher/strategy.json";
import { providers } from "ethers5";

export function fromHexString(hexString: string): Uint8Array {
  const m = hexString.substring(2).match(/.{1,2}/g);

  if (!m) {
    return new Uint8Array([]);
  }

  return Uint8Array.from(m.map((byte: string) => parseInt(byte, 16)));
}

export function encrypt(
  msg: string,
  nftAddress: string,
  chainID: number
): Uint8Array {
  const conditions = new Conditions.EvmCondition({
    contractAddress: nftAddress,
    chain: chainID,
    standardContractType: "ERC721",
    method: "balanceOf",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: ">",
      value: "0",
    },
  });

  const conditionSet = new ConditionSet([conditions]);

  const depStrategy = DeployedStrategy.fromJSON(JSON.stringify(strategy));
  depStrategy.encrypter.conditions = conditionSet;

  const ciphertext = depStrategy.encrypter.encryptMessage(msg);
  return ciphertext.toBytes();
}

export async function decrypt(msg: Uint8Array): Promise<string> {
  const depStrategy = DeployedStrategy.fromJSON(JSON.stringify(strategy));
  const web3Provider = new providers.Web3Provider((window as any).ethereum);
  let mk: MessageKit;

  try {
    mk = MessageKit.fromBytes(msg);
  } catch (e) {
    console.log("couldn't deserialize");
    console.log(e);
    return "";
  }

  const retrievedMessages = await depStrategy.decrypter.retrieve(
    [mk],
    web3Provider
  );

  const decryptedMessages = retrievedMessages.map((mk: PolicyMessageKit) => {
    if (mk.isDecryptableByReceiver()) {
      return depStrategy!.decrypter.decrypt(mk);
    }
    console.log(mk.errors);

    return new Uint8Array([]);
  });

  return new TextDecoder().decode(decryptedMessages[0]);
}
