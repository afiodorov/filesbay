import {
  ConditionSet,
  Conditions,
  DeployedStrategy,
  PolicyMessageKit,
} from "@nucypher/nucypher-ts";
import strategy from "./nucypher/strategy.json";
import { providers } from "ethers5";

export async function encrypt(msg: string) {
  const conditions = new Conditions.EvmCondition({
    contractAddress: "0x932Ca55B9Ef0b3094E8Fa82435b3b4c50d713043",
    chain: 5,
    standardContractType: "ERC721",
    method: "balanceOf",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: ">=",
      value: "1",
    },
  });

  const conditionSet = new ConditionSet([conditions]);

  const depStrategy = DeployedStrategy.fromJSON(JSON.stringify(strategy));
  depStrategy.encrypter.conditions = conditionSet;

  const ciphertext = depStrategy.encrypter.encryptMessage(msg);

  const web3Provider = new providers.Web3Provider((window as any).ethereum);

  const retrievedMessages = await depStrategy.decrypter.retrieve(
    [ciphertext],
    web3Provider
  );

  const decryptedMessages = retrievedMessages.map((mk: PolicyMessageKit) => {
    if (mk.isDecryptableByReceiver()) {
      return depStrategy!.decrypter.decrypt(mk);
    }

    if (Object.values(mk.errors).length > 0) {
      console.log(mk.errors);
    }
    return new Uint8Array([]);
  });

  console.log(new TextDecoder().decode(decryptedMessages[0]));

  return "a";
}
